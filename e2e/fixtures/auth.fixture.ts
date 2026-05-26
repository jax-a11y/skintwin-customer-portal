import { test as base, expect, Page, BrowserContext } from "@playwright/test";

/**
 * Test role types matching the application's role system.
 */
export type TestRole = "admin" | "salon_owner" | "therapist" | "retail_customer";

/**
 * Header name for specifying test role in E2E tests.
 */
export const TEST_AUTH_HEADER = "x-e2e-test-role";

/**
 * Role information for testing.
 */
export interface RoleInfo {
  role: TestRole;
  name: string;
  dashboardTitle: string;
  expectedNavItems: string[];
}

/**
 * Role configurations for E2E tests.
 */
export const ROLE_INFO: Record<TestRole, RoleInfo> = {
  admin: {
    role: "admin",
    name: "Test Admin User",
    dashboardTitle: "Admin Dashboard",
    expectedNavItems: [
      "Organizations",
      "Locations",
      "Therapists",
      "Customers",
      "Bookings",
      "Orders",
      "Products",
      "Commissions",
      "Procurement",
      "Reports",
      "Integrations",
      "Settings",
    ],
  },
  salon_owner: {
    role: "salon_owner",
    name: "Test Salon Owner",
    dashboardTitle: "Salon Dashboard",
    expectedNavItems: [
      "Locations",
      "Therapists",
      "Customers",
      "Bookings",
      "Orders",
      "Commissions",
      "Products",
      "Reports",
      "Integrations",
      "Settings",
    ],
  },
  therapist: {
    role: "therapist",
    name: "Test Therapist",
    dashboardTitle: "Therapist Dashboard",
    expectedNavItems: [
      "My Customers",
      "Bookings",
      "Consultations",
      "Treatments",
      "Commissions",
    ],
  },
  retail_customer: {
    role: "retail_customer",
    name: "Test Customer",
    dashboardTitle: "My Dashboard",
    expectedNavItems: [
      "My Bookings",
      "My Orders",
      "Consultations",
      "Treatments",
      "Products",
    ],
  },
};

/**
 * Extended fixtures for authenticated testing.
 */
type AuthFixtures = {
  /**
   * Authenticated page for a specific role.
   * Uses extra HTTP headers to authenticate requests.
   */
  authenticatedPage: (role: TestRole) => Promise<Page>;

  /**
   * Create a browser context with authentication for a role.
   */
  authenticatedContext: (role: TestRole) => Promise<BrowserContext>;

  /**
   * Get role information.
   */
  getRoleInfo: (role: TestRole) => RoleInfo;
};

/**
 * Extended test with authentication fixtures.
 */
export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ browser }, use) => {
    const pages: Page[] = [];

    const createAuthenticatedPage = async (role: TestRole): Promise<Page> => {
      const context = await browser.newContext({
        extraHTTPHeaders: {
          [TEST_AUTH_HEADER]: role,
        },
      });

      const page = await context.newPage();
      pages.push(page);
      return page;
    };

    await use(createAuthenticatedPage);

    // Cleanup all created pages
    for (const page of pages) {
      await page.close();
    }
  },

  authenticatedContext: async ({ browser }, use) => {
    const contexts: BrowserContext[] = [];

    const createAuthenticatedContext = async (
      role: TestRole
    ): Promise<BrowserContext> => {
      const context = await browser.newContext({
        extraHTTPHeaders: {
          [TEST_AUTH_HEADER]: role,
        },
      });

      contexts.push(context);
      return context;
    };

    await use(createAuthenticatedContext);

    // Cleanup all created contexts
    for (const context of contexts) {
      await context.close();
    }
  },

  getRoleInfo: async ({}, use) => {
    const getRoleInfo = (role: TestRole): RoleInfo => {
      return ROLE_INFO[role];
    };

    await use(getRoleInfo);
  },
});

export { expect };

/**
 * Helper to test a page with all roles.
 */
export function forEachRole(
  testFn: (role: TestRole, info: RoleInfo) => void
): void {
  const roles: TestRole[] = ["admin", "salon_owner", "therapist", "retail_customer"];

  for (const role of roles) {
    testFn(role, ROLE_INFO[role]);
  }
}

/**
 * Test tags for filtering tests.
 */
export const tags = {
  smoke: "@smoke",
  full: "@full",
  public: "@public",
  authenticated: "@authenticated",
  dashboard: "@dashboard",
  interaction: "@interaction",
};
