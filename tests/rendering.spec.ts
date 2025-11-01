import { test, expect } from "@playwright/test";

test("page loads and renders main content", async ({ page }) => {
  // Navigate to the home page
  await page.goto("/");

  // Check page title
  await expect(page).toHaveTitle("George Pearse | Projects");

  // Check that the page contains the meta description
  const description = page.locator("meta[name='description']");
  await expect(description).toHaveAttribute(
    "content",
    /A living notebook of projects/
  );

  // Wait for root element to exist
  const root = page.locator("#root");
  await expect(root).toBeVisible();

  // Check that main content area is visible
  await expect(root).toBeInViewport();
});

test("renders without JavaScript errors", async ({ page }) => {
  let errorMessages: string[] = [];

  // Capture any page errors
  page.on("pageerror", (error) => {
    errorMessages.push(error.message);
  });

  // Navigate to the home page
  await page.goto("/");

  // Wait for the page to fully load
  await page.waitForLoadState("networkidle");

  // Verify no critical errors occurred
  expect(errorMessages).toHaveLength(0);
});

test("renders with CSS and JS assets loaded", async ({ page }) => {
  await page.goto("/");

  // Wait for all resources to load
  await page.waitForLoadState("networkidle");

  // Check that at least one link element exists in the head (could be stylesheet or favicon)
  const links = await page.locator("head link").count();
  expect(links).toBeGreaterThan(0);

  // Check that scripts are loaded
  const scripts = await page.locator("script").count();
  expect(scripts).toBeGreaterThan(0);

  // Verify CSS is applied (body should have computed styles)
  const bodyStyles = await page.locator("body").evaluate((el) => {
    const computed = window.getComputedStyle(el);
    return {
      backgroundColor: computed.backgroundColor,
      color: computed.color,
    };
  });
  expect(bodyStyles.backgroundColor).toBeTruthy();
  expect(bodyStyles.color).toBeTruthy();
});

test("renders for multiple browsers", async ({ page, browserName }) => {
  // This test verifies the page renders across different browsers
  await page.goto("/");

  // Wait for content to be visible
  const root = page.locator("#root");
  await expect(root).toBeVisible();

  // Verify we can access the page in each browser context
  const title = await page.title();
  expect(title).toContain("George Pearse");
});
