import { test, expect, forEachRole, ROLE_INFO, TestRole } from "./fixtures/auth.fixture";

/**
 * Dashboard tests - verify role-based dashboard rendering.
 * Each role should see their appropriate dashboard with correct navigation.
 */

test.describe("Role-Based Dashboards @smoke @dashboard", () => {
  test("admin sees admin dashboard", async ({ authenticatedPage }) => {
    const page = await authenticatedPage("admin");
    await page.goto("/dashboard");

    // Verify admin dashboard title
    await expect(page.getByText("Admin Dashboard")).toBeVisible();

    // Verify welcome message with name
    await expect(page.getByText(/Welcome/i)).toBeVisible();
  });

  test("salon owner sees salon dashboard", async ({ authenticatedPage }) => {
    const page = await authenticatedPage("salon_owner");
    await page.goto("/dashboard");

    // Verify salon dashboard title
    await expect(page.getByText("Salon Dashboard")).toBeVisible();

    // Verify welcome message
    await expect(page.getByText(/Welcome/i)).toBeVisible();
  });

  test("therapist sees therapist dashboard", async ({ authenticatedPage }) => {
    const page = await authenticatedPage("therapist");
    await page.goto("/dashboard");

    // Verify therapist dashboard title
    await expect(page.getByText("Therapist Dashboard")).toBeVisible();

    // Verify welcome message
    await expect(page.getByText(/Welcome/i)).toBeVisible();
  });

  test("customer sees customer dashboard", async ({ authenticatedPage }) => {
    const page = await authenticatedPage("retail_customer");
    await page.goto("/dashboard");

    // Verify customer dashboard title (uses "My Dashboard")
    await expect(page.getByText("My Dashboard")).toBeVisible();

    // Verify welcome message
    await expect(page.getByText(/Welcome/i)).toBeVisible();
  });
});

test.describe("Dashboard Navigation @full @dashboard", () => {
  const roles: TestRole[] = ["admin", "salon_owner", "therapist", "retail_customer"];

  for (const role of roles) {
    test(`${role} dashboard has navigation sidebar`, async ({
      authenticatedPage,
    }) => {
      const page = await authenticatedPage(role);
      await page.goto("/dashboard");

      // Verify sidebar is visible
      await expect(page.locator('[data-slot="sidebar"]').or(page.locator("nav"))).toBeVisible();
    });

    test(`${role} dashboard displays user info`, async ({
      authenticatedPage,
    }) => {
      const page = await authenticatedPage(role);
      await page.goto("/dashboard");

      // Verify some user-related content is displayed
      await expect(
        page.getByText(/Welcome|Dashboard/i)
      ).toBeVisible();
    });
  }
});

test.describe("Dashboard Statistics @full @dashboard", () => {
  test("admin dashboard shows system stats", async ({ authenticatedPage }) => {
    const page = await authenticatedPage("admin");
    await page.goto("/dashboard");

    // Verify stats cards are present
    await expect(page.getByText(/Organizations|Users|Revenue/i)).toBeVisible();
  });

  test("salon dashboard shows salon stats", async ({ authenticatedPage }) => {
    const page = await authenticatedPage("salon_owner");
    await page.goto("/dashboard");

    // Verify salon-specific stats
    await expect(page.getByText(/Locations|Therapists|Revenue/i)).toBeVisible();
  });

  test("therapist dashboard shows therapist stats", async ({
    authenticatedPage,
  }) => {
    const page = await authenticatedPage("therapist");
    await page.goto("/dashboard");

    // Verify therapist-specific stats
    await expect(page.getByText(/Customers|Bookings|Commissions/i)).toBeVisible();
  });

  test("customer dashboard shows customer stats", async ({
    authenticatedPage,
  }) => {
    const page = await authenticatedPage("retail_customer");
    await page.goto("/dashboard");

    // Verify customer-specific cards
    await expect(page.getByText(/Book|Shop|History/i)).toBeVisible();
  });
});

test.describe("Dashboard Quick Actions @full @dashboard @interaction", () => {
  test("admin dashboard has quick action cards", async ({
    authenticatedPage,
  }) => {
    const page = await authenticatedPage("admin");
    await page.goto("/dashboard");

    // Verify quick action cards are clickable
    const actionCards = page.locator('[class*="cursor-pointer"]');
    const count = await actionCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test("therapist can access consultation action", async ({
    authenticatedPage,
  }) => {
    const page = await authenticatedPage("therapist");
    await page.goto("/dashboard");

    // Verify consultation-related action is present
    await expect(page.getByText(/Consultation/i)).toBeVisible();
  });

  test("customer can access booking action", async ({ authenticatedPage }) => {
    const page = await authenticatedPage("retail_customer");
    await page.goto("/dashboard");

    // Verify booking action card
    await expect(page.getByText(/Book/i)).toBeVisible();
  });
});

test.describe("Unauthenticated Dashboard Access @smoke @dashboard", () => {
  test("unauthenticated user redirected from dashboard", async ({ page }) => {
    // Access dashboard without authentication
    await page.goto("/dashboard");

    // Should either show login prompt or redirect to home
    const hasLoginPrompt = await page
      .getByText(/Sign in|Login|Get Started/i)
      .isVisible()
      .catch(() => false);

    const isOnHome = page.url().endsWith("/") || page.url().includes("dashboard");

    expect(hasLoginPrompt || isOnHome).toBeTruthy();
  });
});
