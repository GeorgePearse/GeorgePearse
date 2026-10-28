import { test, expect } from "@playwright/test";
import { projects } from "../src/projects";

const socialLinks = [
  "https://github.com/GeorgePearse",
  "https://www.linkedin.com/in/georgepearse/",
  "https://x.com/Georgehwp1",
  "https://visia.ai",
];

test("landing page renders five projects on a navy background", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");
  await expect(page).toHaveTitle("George Pearse | Projects");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("George Pearse");

  const links = page.locator(".project-link");
  await expect(links).toHaveCount(5);
  expect(projects).toHaveLength(5);
  for (const [index, project] of projects.entries()) {
    await expect(links.nth(index)).toHaveAttribute("href", project.url);
    await expect(links.nth(index)).toHaveText(project.name);
    expect(project.description.length).toBeGreaterThan(80);
  }

  const social = page.locator(".social-link");
  await expect(social).toHaveCount(socialLinks.length);
  for (const [index, href] of socialLinks.entries()) {
    await expect(social.nth(index)).toHaveAttribute("href", href);
  }

  const photo = page.locator(".photo");
  await expect(photo).toBeVisible();
  const shape = await photo.evaluate((el) => {
    const { borderRadius } = getComputedStyle(el);
    const { width, height, left, top } = el.getBoundingClientRect();
    const column = el.closest("main")!.getBoundingClientRect();
    return { borderRadius, width, height, left, top, column, viewport: window.innerWidth };
  });
  expect(shape.borderRadius).toBe("50%");
  expect(shape.width).toBe(shape.height);
  const columnMargin = (shape.viewport - shape.column.width) / 2;
  expect(Math.abs(shape.column.left - columnMargin)).toBeLessThan(1);
  expect(shape.left - shape.column.left).toBeLessThan(60);
  expect(shape.top - shape.column.top).toBeLessThan(100);

  const background = await page
    .locator("body")
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(background).toBe("rgb(6, 16, 36)");

  expect(errors).toEqual([]);
});
