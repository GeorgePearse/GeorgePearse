#!/usr/bin/env python3
"""Import posts from a Medium RSS feed into src/content/writing as Markdown.

Medium's RSS feed carries the full post body in <content:encoded>, so this needs
no scraping and no API key. Images are downloaded into public/writing-images so
the site does not depend on Medium's CDN staying up.

Re-runnable: existing files are overwritten, so refreshing after a new post is
just `python3 scripts/import_medium.py`.

Caveat: Medium caps the feed at the 10 most recent posts. Anything older has to
come from a Medium data export (Settings -> Download your information).
"""

from __future__ import annotations

import argparse
import hashlib
import html
import pathlib
import re
import urllib.request
import xml.etree.ElementTree as ET
from email.utils import parsedate_to_datetime
from html.parser import HTMLParser

FEED = "https://medium.com/feed/@george.pearse"
CONTENT_NS = "{http://purl.org/rss/1.0/modules/content/}encoded"
ROOT = pathlib.Path(__file__).resolve().parent.parent
POSTS_DIR = ROOT / "src" / "content" / "writing"
IMAGE_DIR = ROOT / "public" / "writing-images"
IMAGE_URL_BASE = "/GeorgePearse/writing-images"

# Medium appends a subscribe/footer block to every feed item; it is chrome, not
# writing, so it is dropped rather than imported.
FOOTER_MARKERS = (
    "was originally published in",
    "Sign up for",
)

BLOCK_TAGS = {"p", "h1", "h2", "h3", "h4", "h5", "h6", "pre", "blockquote", "figure", "figcaption"}
HEADING_LEVEL = {"h1": 2, "h2": 2, "h3": 2, "h4": 3, "h5": 4, "h6": 4}


class MediumHTMLParser(HTMLParser):
    """Turns Medium's narrow HTML subset into Markdown blocks."""

    def __init__(self, on_image):
        super().__init__(convert_charrefs=True)
        self.on_image = on_image
        self.blocks: list[str] = []
        self._buffer: list[str] = []
        self._block: str | None = None
        self._href: str | None = None
        self._in_pre = False
        self._list_stack: list[dict] = []

    # -- block plumbing -------------------------------------------------
    def _flush(self) -> None:
        text = "".join(self._buffer)
        self._buffer.clear()
        tag, self._block = self._block, None
        if tag is None:
            return
        if tag != "pre":
            text = re.sub(r"[ \t]+", " ", text).strip()
        else:
            text = text.strip("\n")
        if not text:
            return
        if tag in HEADING_LEVEL:
            self.blocks.append("#" * HEADING_LEVEL[tag] + " " + text)
        elif tag == "pre":
            self.blocks.append("```\n" + text + "\n```")
        elif tag == "blockquote":
            self.blocks.append("\n".join("> " + line for line in text.split("\n")))
        elif tag == "figcaption":
            self.blocks.append("*" + text + "*")
        else:
            self.blocks.append(text)

    def handle_starttag(self, tag, attrs):  # noqa: C901
        attrs = dict(attrs)
        if tag in BLOCK_TAGS:
            self._flush()
            self._block = tag
            self._in_pre = tag == "pre"
        elif tag in ("ul", "ol"):
            self._flush()
            self._list_stack.append({"ordered": tag == "ol", "index": 0})
        elif tag == "li" and self._list_stack:
            self._flush()
            state = self._list_stack[-1]
            state["index"] += 1
            marker = f"{state['index']}." if state["ordered"] else "-"
            indent = "  " * (len(self._list_stack) - 1)
            self._block = "p"
            self._buffer.append(f"{indent}{marker} ")
        elif tag == "a":
            self._href = attrs.get("href")
            self._buffer.append("[")
        elif tag in ("strong", "b"):
            self._buffer.append("**")
        elif tag in ("em", "i"):
            self._buffer.append("*")
        elif tag == "code" and not self._in_pre:
            self._buffer.append("`")
        elif tag == "br":
            self._buffer.append("\n")
        elif tag == "hr":
            self._flush()
            self.blocks.append("---")
        elif tag == "img":
            src = attrs.get("src")
            # Medium ends every feed item with a 1x1 analytics beacon.
            if src and "/_/stat?" not in src:
                self._flush()
                self.blocks.append(f"![{attrs.get('alt', '').strip()}]({self.on_image(src)})")

    def handle_endtag(self, tag):
        if tag in BLOCK_TAGS:
            self._flush()
            self._in_pre = False
        elif tag in ("ul", "ol"):
            self._flush()
            if self._list_stack:
                self._list_stack.pop()
        elif tag == "li":
            self._flush()
        elif tag == "a":
            href = self._href or ""
            self._href = None
            self._buffer.append(f"]({href})")
        elif tag in ("strong", "b"):
            self._buffer.append("**")
        elif tag in ("em", "i"):
            self._buffer.append("*")
        elif tag == "code" and not self._in_pre:
            self._buffer.append("`")

    def handle_data(self, data):
        if self._block is None and data.strip():
            self._block = "p"
        self._buffer.append(data)

    def close(self):
        super().close()
        self._flush()


def download_image(url: str) -> str:
    """Mirror a Medium CDN image locally, returning the site-relative path."""
    clean = url.split("?")[0]
    suffix = pathlib.Path(clean).suffix or ".jpg"
    if len(suffix) > 5:
        suffix = ".jpg"
    name = hashlib.sha1(clean.encode()).hexdigest()[:16] + suffix
    target = IMAGE_DIR / name
    if not target.exists():
        IMAGE_DIR.mkdir(parents=True, exist_ok=True)
        request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                target.write_bytes(response.read())
            print(f"    image {name}")
        except Exception as error:  # noqa: BLE001 - a missing image must not fail the import
            print(f"    image FAILED {url}: {error}")
            return url
    return f"{IMAGE_URL_BASE}/{name}"


def tidy_emphasis(text: str) -> str:
    """Move whitespace out of emphasis spans so Markdown can close them.

    Medium emits `<strong>MMStack </strong>`, which becomes `**MMStack **` — a
    closing marker preceded by a space, which Markdown will not close. The fix
    has to work on the whole span: nudging individual markers moves the space to
    the wrong side of the opening one.
    """

    def rewrite(match: re.Match[str]) -> str:
        marker, inner = match.group(1), match.group(2)
        stripped = inner.strip()
        if not stripped:
            return inner
        leading = " " if inner[:1].isspace() else ""
        trailing = " " if inner[-1:].isspace() else ""
        return f"{leading}{marker}{stripped}{marker}{trailing}"

    text = re.sub(r"(\*\*)(?!\s*\*)(.+?)\1", rewrite, text, flags=re.S)
    text = re.sub(r"(?<!\*)(\*)(?!\*)(.+?)(?<!\*)\1(?!\*)", rewrite, text, flags=re.S)
    return re.sub(r"[ \t]{2,}", " ", text)


def strip_footer(blocks: list[str]) -> list[str]:
    for index, block in enumerate(blocks):
        if any(marker in block for marker in FOOTER_MARKERS):
            return blocks[:index]
    return blocks


def slug_from_link(link: str) -> str:
    tail = link.split("?")[0].rstrip("/").split("/")[-1]
    return re.sub(r"-[0-9a-f]{8,}$", "", tail) or "post"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--feed", default=FEED)
    args = parser.parse_args()

    request = urllib.request.Request(args.feed, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request, timeout=60) as response:
        feed = ET.fromstring(response.read())

    POSTS_DIR.mkdir(parents=True, exist_ok=True)
    for item in feed.findall(".//item"):
        title = (item.findtext("title") or "Untitled").strip()
        link = (item.findtext("link") or "").split("?")[0]
        published = parsedate_to_datetime(item.findtext("pubDate")).date().isoformat()
        tags = [element.text for element in item.findall("category") if element.text]
        body = item.find(CONTENT_NS)

        print(f"  {published}  {title}")
        markdown_parser = MediumHTMLParser(on_image=download_image)
        markdown_parser.feed(html.unescape(body.text or "") if body is not None else "")
        markdown_parser.close()
        blocks = [
            block if block.startswith("```") else tidy_emphasis(block)
            for block in strip_footer(markdown_parser.blocks)
        ]

        # Medium repeats the title as the first heading; the site renders it from
        # frontmatter, so keep the body free of a duplicate.
        if blocks and blocks[0].lstrip("# ").strip().lower() == title.lower():
            blocks = blocks[1:]

        tag_list = ", ".join(f'"{tag}"' for tag in tags)
        frontmatter = "\n".join(
            [
                "---",
                f'title: "{title.replace(chr(34), chr(39))}"',
                f"date: {published}",
                f'canonical: "{link}"',
                f"tags: [{tag_list}]",
                "---",
                "",
            ]
        )
        target = POSTS_DIR / f"{published}-{slug_from_link(link)}.md"
        target.write_text(frontmatter + "\n\n".join(blocks) + "\n", encoding="utf-8")

    print(f"\nWrote {len(list(POSTS_DIR.glob('*.md')))} posts to {POSTS_DIR.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
