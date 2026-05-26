/**
 * Test Authentication Layer for E2E Testing
 *
 * This module provides deterministic authentication for CI E2E tests.
 * It is ONLY enabled when E2E_TEST_MODE environment variable is set to "true".
 *
 * SECURITY: This module is strictly gated and will fail closed when disabled.
 * Never enable E2E_TEST_MODE in production environments.
 */

import type { Request } from "express";
import type { User } from "../../drizzle/schema";

/**
 * Check if test authentication mode is enabled.
 * This should ONLY be true in E2E test environments.
 */
export function isTestAuthEnabled(): boolean {
  const testMode = process.env.E2E_TEST_MODE;
  return testMode === "true";
}

/**
 * Test user role types that match the application's role system.
 */
export type TestRole = "admin" | "salon_owner" | "therapist" | "retail_customer";

/**
 * Test user identities for deterministic E2E testing.
 * Each role has a unique test identity with predictable values.
 */
const TEST_USERS: Record<TestRole, User> = {
  admin: {
    id: 9001,
    openId: "test-admin-open-id",
    workosUserId: null,
    name: "Test Admin User",
    email: "admin@test.skintwin.local",
    phone: "+1234567890",
    loginMethod: "test",
    role: "admin",
    organizationId: null,
    avatarUrl: null,
    isActive: true,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
    lastSignedIn: new Date("2024-01-01T00:00:00Z"),
  },
  salon_owner: {
    id: 9002,
    openId: "test-salon-owner-open-id",
    workosUserId: null,
    name: "Test Salon Owner",
    email: "salonowner@test.skintwin.local",
    phone: "+1234567891",
    loginMethod: "test",
    role: "salon_owner",
    organizationId: 1,
    avatarUrl: null,
    isActive: true,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
    lastSignedIn: new Date("2024-01-01T00:00:00Z"),
  },
  therapist: {
    id: 9003,
    openId: "test-therapist-open-id",
    workosUserId: null,
    name: "Test Therapist",
    email: "therapist@test.skintwin.local",
    phone: "+1234567892",
    loginMethod: "test",
    role: "therapist",
    organizationId: 1,
    avatarUrl: null,
    isActive: true,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
    lastSignedIn: new Date("2024-01-01T00:00:00Z"),
  },
  retail_customer: {
    id: 9004,
    openId: "test-customer-open-id",
    workosUserId: null,
    name: "Test Customer",
    email: "customer@test.skintwin.local",
    phone: "+1234567893",
    loginMethod: "test",
    role: "retail_customer",
    organizationId: null,
    avatarUrl: null,
    isActive: true,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
    lastSignedIn: new Date("2024-01-01T00:00:00Z"),
  },
};

/**
 * Header name for specifying test role in E2E tests.
 * Only processed when E2E_TEST_MODE is enabled.
 */
export const TEST_AUTH_HEADER = "x-e2e-test-role";

/**
 * Parse test role from request header.
 * Returns null if not a valid test role or test mode is disabled.
 */
function parseTestRole(req: Request): TestRole | null {
  const roleHeader = req.headers[TEST_AUTH_HEADER];

  if (!roleHeader || typeof roleHeader !== "string") {
    return null;
  }

  const normalizedRole = roleHeader.toLowerCase().trim();

  if (normalizedRole in TEST_USERS) {
    return normalizedRole as TestRole;
  }

  return null;
}

/**
 * Attempt to authenticate request using test authentication.
 * Returns null if:
 * - Test mode is not enabled
 * - No valid test role header is present
 *
 * This function is safe to call in any environment - it will only
 * return a test user when explicitly enabled via E2E_TEST_MODE.
 */
export function tryTestAuth(req: Request): User | null {
  // Fail closed: return null if test mode is not explicitly enabled
  if (!isTestAuthEnabled()) {
    return null;
  }

  const testRole = parseTestRole(req);

  if (!testRole) {
    return null;
  }

  console.log(`[TestAuth] Authenticating as test user: ${testRole}`);
  return TEST_USERS[testRole];
}

/**
 * Get a test user by role for use in E2E test fixtures.
 * Throws an error if test mode is not enabled.
 */
export function getTestUser(role: TestRole): User {
  if (!isTestAuthEnabled()) {
    throw new Error(
      "Test authentication is not enabled. Set E2E_TEST_MODE=true to enable."
    );
  }

  return TEST_USERS[role];
}

/**
 * Get all available test roles.
 */
export function getTestRoles(): readonly TestRole[] {
  return ["admin", "salon_owner", "therapist", "retail_customer"] as const;
}
