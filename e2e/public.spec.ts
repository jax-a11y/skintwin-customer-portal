import { test, expect } from "@playwright/test";

/**
 * Public page tests - no authentication required.
 * These tests verify the public-facing pages work correctly.
 */

test.describe("Public Pages @smoke @public", () => {
  test("home page renders correctly", async ({ page }) => {
    await page.goto("/");

    // Verify main hero content
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByText("SkinTwin")).toBeVisible();

    // Verify sign-in CTA is visible
    await expect(
      page.getByRole("link", { name: /sign in|get started/i })
    ).toBeVisible();
  });

  test("home page displays marketing modules", async ({ page }) => {
    await page.goto("/");

    // Verify key feature sections are present
    await expect(page.getByText(/B2B2C CRM/i)).toBeVisible();
    await expect(page.getByText(/B2B PRM/i)).toBeVisible();
    await expect(page.getByText(/Shopify/i)).toBeVisible();
  });

  test("home page has correct navigation elements", async ({ page }) => {
    await page.goto("/");

    // Verify navigation brand
    await expect(page.getByText("SkinTwin").first()).toBeVisible();
  });

  test("404 page renders for unknown routes", async ({ page }) => {
    await page.goto("/unknown-route-that-does-not-exist");

    // Verify 404 content
    await expect(page.getByText(/not found|404/i)).toBeVisible();
  });

  test("home page has no console errors", async ({ page }) => {
    const errors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Filter out expected React development warnings
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes("React DevTools") &&
        !e.includes("Download the React DevTools")
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test("home page is responsive on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Verify content is still visible on mobile
    await expect(page.getByText("SkinTwin").first()).toBeVisible();
  });

  test("home page loads within acceptable time @smoke", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const loadTime = Date.now() - startTime;

    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });
});

test.describe("Public Page Meta @full @public", () => {
  test("home page has valid document structure", async ({ page }) => {
    await page.goto("/");

    // Check for proper HTML structure
    await expect(page.locator("html")).toHaveAttribute("lang", /.+/);

    // Verify root element exists
    await expect(page.locator("#root")).toBeVisible();
  });

  test("navigation does not have broken links", async ({ page }) => {
    await page.goto("/");

    // Get all navigation links
    const navLinks = page.locator('nav a[href^="/"]');
    const count = await navLinks.count();

    // Verify links exist
    expect(count).toBeGreaterThan(0);

    // Check that links have valid href attributes
    for (let i = 0; i < count; i++) {
      const href = await navLinks.nth(i).getAttribute("href");
      expect(href).toBeTruthy();
      expect(href).toMatch(/^\//);
    }
  });
});
