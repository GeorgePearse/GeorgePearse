import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MarkdownContentProps {
  content: string;
  components?: Components;
}

const baseComponents: Components = {
  code(props) {
    const { children, className, node: _node, ...rest } = props;
    const match = /language-(\w+)/.exec(className || "");

    return match ? (
      <SyntaxHighlighter style={oneLight as any} language={match[1]} PreTag="div">
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    ) : (
      <code className={className} {...rest}>
        {children}
      </code>
    );
  },
};

export const MarkdownContent = ({ content, components }: MarkdownContentProps) => (
  <div className="markdown-content">
    <Markdown remarkPlugins={[remarkGfm]} components={{ ...baseComponents, ...components }}>
      {content}
    </Markdown>
  </div>
);
