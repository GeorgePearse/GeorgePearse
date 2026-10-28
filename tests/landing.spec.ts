import { test, expect } from "@playwright/test";
import { projects } from "../src/projects";

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
  }

  const photo = page.locator(".photo");
  await expect(photo).toBeVisible();
  const shape = await photo.evaluate((el) => {
    const { borderRadius } = getComputedStyle(el);
    const { width, height } = el.getBoundingClientRect();
    return { borderRadius, width, height };
  });
  expect(shape.borderRadius).toBe("50%");
  expect(shape.width).toBe(shape.height);

  const background = await page
    .locator("body")
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(background).toBe("rgb(11, 29, 58)");

  expect(errors).toEqual([]);
});
