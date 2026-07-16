import { test, expect, TestRole } from "./fixtures/auth.fixture";

/**
 * Route coverage tests - verify all application routes are accessible.
 * Tests both authenticated and unauthenticated route behavior.
 */

/**
 * All application routes from App.tsx router.
 */
const ALL_ROUTES = [
  "/",
  "/dashboard",
  "/bookings",
  "/orders",
  "/products",
  "/customers",
  "/therapists",
  "/consultations",
  "/treatments",
  "/commissions",
  "/integrations",
  "/procurement",
  "/reports",
  "/locations",
  "/settings",
  "/404",
] as const;

/**
 * Routes that require authentication.
 */
const PROTECTED_ROUTES = [
  "/dashboard",
  "/bookings",
  "/orders",
  "/products",
  "/customers",
  "/therapists",
  "/consultations",
  "/treatments",
  "/commissions",
  "/integrations",
  "/procurement",
  "/reports",
  "/locations",
  "/settings",
] as const;

/**
 * Public routes accessible without authentication.
 */
const PUBLIC_ROUTES = ["/", "/404"] as const;

test.describe("Route Accessibility @smoke", () => {
  test("home route is accessible", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
  });

  test("404 route is accessible", async ({ page }) => {
    const response = await page.goto("/404");
    expect(response?.status()).toBe(200);
    await expect(page.getByText(/not found|404/i).first()).toBeVisible();
  });

  test("unknown routes show 404 page", async ({ page }) => {
    await page.goto("/this-route-definitely-does-not-exist");
    await expect(page.getByText(/not found|404/i).first()).toBeVisible();
  });
});

test.describe("Protected Routes - Admin @full", () => {
  for (const route of PROTECTED_ROUTES) {
    test(`admin can access ${route}`, async ({ authenticatedPage }) => {
      const page = await authenticatedPage("admin");
      const response = await page.goto(route);

      // Should not get error status codes
      expect(response?.status()).toBeLessThan(500);

      // Page should render without crashing
      await expect(page.locator("body")).toBeVisible();
    });
  }
});

test.describe("Protected Routes - Salon Owner @full", () => {
  for (const route of PROTECTED_ROUTES) {
    test(`salon owner can access ${route}`, async ({ authenticatedPage }) => {
      const page = await authenticatedPage("salon_owner");
      const response = await page.goto(route);

      expect(response?.status()).toBeLessThan(500);
      await expect(page.locator("body")).toBeVisible();
    });
  }
});

test.describe("Protected Routes - Therapist @full", () => {
  for (const route of PROTECTED_ROUTES) {
    test(`therapist can access ${route}`, async ({ authenticatedPage }) => {
      const page = await authenticatedPage("therapist");
      const response = await page.goto(route);

      expect(response?.status()).toBeLessThan(500);
      await expect(page.locator("body")).toBeVisible();
    });
  }
});

test.describe("Protected Routes - Customer @full", () => {
  for (const route of PROTECTED_ROUTES) {
    test(`customer can access ${route}`, async ({ authenticatedPage }) => {
      const page = await authenticatedPage("retail_customer");
      const response = await page.goto(route);

      expect(response?.status()).toBeLessThan(500);
      await expect(page.locator("body")).toBeVisible();
    });
  }
});

test.describe("Route Page Titles @full", () => {
  const routeTitles: Record<string, string[]> = {
    "/bookings": ["Bookings", "appointments"],
    "/orders": ["Orders"],
    "/products": ["Products"],
    "/customers": ["Customers"],
    "/therapists": ["Therapist"],
    "/consultations": ["Consultation"],
    "/treatments": ["Treatment"],
    "/commissions": ["Commission"],
    "/integrations": ["Integration"],
    "/procurement": ["Procurement"],
    "/reports": ["Reports", "Analytics"],
    "/locations": ["Location"],
    "/settings": ["Settings"],
  };

  for (const [route, expectedTexts] of Object.entries(routeTitles)) {
    test(`${route} has correct page title`, async ({ authenticatedPage }) => {
      const page = await authenticatedPage("admin");
      await page.goto(route);

      // Check for any of the expected texts
      let found = false;
      for (const text of expectedTexts) {
        const isVisible = await page
          .getByText(new RegExp(text, "i"))
          .first()
          .isVisible()
          .catch(() => false);
        if (isVisible) {
          found = true;
          break;
        }
      }

      expect(found).toBeTruthy();
    });
  }
});

test.describe("Route Navigation @full", () => {
  test("can navigate between routes via sidebar", async ({
    authenticatedPage,
  }) => {
    const page = await authenticatedPage("admin");
    await page.goto("/dashboard");

    // Click on a navigation item
    await page.getByRole("button", { name: /Bookings/i }).or(
      page.getByText(/Bookings/i).first()
    ).click();

    // Should navigate to bookings
    await page.waitForURL(/bookings/);
    expect(page.url()).toContain("bookings");
  });

  test("browser back button works correctly", async ({ authenticatedPage }) => {
    const page = await authenticatedPage("admin");

    await page.goto("/dashboard");
    await page.goto("/bookings");

    // Go back
    await page.goBack();

    // Should be back at dashboard
    await page.waitForURL(/dashboard/);
  });
});

test.describe("Route Error Handling @smoke", () => {
  test("routes handle missing data gracefully", async ({
    authenticatedPage,
  }) => {
    const page = await authenticatedPage("admin");

    // Navigate to a data-dependent page
    await page.goto("/customers");

    // Should render without crashing (may show empty state)
    await expect(page.locator("body")).toBeVisible();

    // Should not show error boundary
    const errorBoundary = await page
      .getByText(/something went wrong/i)
      .isVisible()
      .catch(() => false);
    expect(errorBoundary).toBeFalsy();
  });

  for (const role of ["admin", "salon_owner", "therapist", "retail_customer"] as TestRole[]) {
    test(`${role} routes have no console errors`, async ({
      authenticatedPage,
    }) => {
      const page = await authenticatedPage(role);
      const errors: string[] = [];

      page.on("console", (msg) => {
        if (msg.type() === "error") {
          errors.push(msg.text());
        }
      });

      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");

      // Filter expected warnings
      const criticalErrors = errors.filter(
        (e) =>
          !e.includes("React DevTools") &&
          !e.includes("Download the React DevTools") &&
          !e.includes("Failed to fetch") // Expected in test mode without DB
      );

      expect(criticalErrors).toHaveLength(0);
    });
  }
});
