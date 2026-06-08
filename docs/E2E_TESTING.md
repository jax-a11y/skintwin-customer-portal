# E2E Testing Guide

This document describes the end-to-end (E2E) testing setup and conventions for the SkinTwin Customer Portal.

## Overview

E2E tests verify the application works correctly from the user's perspective by testing complete user flows through the browser.

### Technology Stack

- **Framework:** [Playwright](https://playwright.dev/)
- **Language:** TypeScript
- **Browsers:** Chromium, Firefox, WebKit

## Directory Structure

```
e2e/
├── fixtures/
│   └── auth.fixture.ts    # Authentication fixtures
├── public.spec.ts         # Public page tests
├── dashboard.spec.ts      # Dashboard tests
├── routes.spec.ts         # Route coverage tests
└── interactions.spec.ts   # UI interaction tests
```

## Test Fixtures

### Authentication Fixture

The `auth.fixture.ts` provides authenticated test contexts:

```typescript
import { test, expect, TestRole } from "./fixtures/auth.fixture";

// Available roles
type TestRole = "admin" | "salon_owner" | "therapist" | "retail_customer";

// Use authenticated page
test("admin can access dashboard", async ({ authenticatedPage }) => {
  const page = await authenticatedPage("admin");
  await page.goto("/dashboard");
  // ...
});
```

### Role Information

```typescript
import { ROLE_INFO, getRoleInfo } from "./fixtures/auth.fixture";

// Get role details
const info = ROLE_INFO["admin"];
// {
//   role: "admin",
//   name: "Test Admin User",
//   dashboardTitle: "Admin Dashboard",
//   expectedNavItems: [...]
// }
```

## Test Tags

Tests are tagged for filtering:

| Tag | Description | Run Command |
|-----|-------------|-------------|
| `@smoke` | Critical path tests (PR tier) | `--grep "@smoke"` |
| `@full` | Complete test coverage | Default |
| `@public` | Public page tests | `--grep "@public"` |
| `@authenticated` | Tests requiring login | `--grep "@authenticated"` |
| `@dashboard` | Dashboard tests | `--grep "@dashboard"` |
| `@interaction` | UI interaction tests | `--grep "@interaction"` |

### Examples

```bash
# Run smoke tests
pnpm run e2e --grep "@smoke"

# Run everything except smoke
pnpm run e2e --grep-invert "@smoke"

# Run dashboard tests
pnpm run e2e --grep "@dashboard"
```

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from "@playwright/test";

test.describe("Feature Name @tag", () => {
  test("should do something", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Hello")).toBeVisible();
  });
});
```

### Authenticated Test Structure

```typescript
import { test, expect, TestRole } from "./fixtures/auth.fixture";

test.describe("Authenticated Feature @authenticated", () => {
  test("admin can perform action", async ({ authenticatedPage }) => {
    const page = await authenticatedPage("admin");
    await page.goto("/dashboard");
    // ...
  });

  // Test all roles
  const roles: TestRole[] = ["admin", "salon_owner", "therapist", "retail_customer"];
  for (const role of roles) {
    test(`${role} can access page`, async ({ authenticatedPage }) => {
      const page = await authenticatedPage(role);
      await page.goto("/dashboard");
      // ...
    });
  }
});
```

### Locator Best Practices

```typescript
// ✅ Good - Role-based selectors
page.getByRole("button", { name: /Submit/i })
page.getByRole("heading", { name: /Dashboard/i })
page.getByRole("dialog")

// ✅ Good - Text content
page.getByText(/Welcome/i)
page.getByLabel("Email")
page.getByPlaceholder("Enter name")

// ⚠️ Okay - Test IDs (use sparingly)
page.getByTestId("submit-button")

// ❌ Avoid - CSS selectors
page.locator(".btn-primary")
page.locator("#submit")
```

### Assertions

```typescript
// Visibility
await expect(page.getByText("Hello")).toBeVisible();
await expect(page.getByRole("dialog")).not.toBeVisible();

// Content
await expect(page.getByRole("heading")).toHaveText("Dashboard");
await expect(page.locator("input")).toHaveValue("test@example.com");

// State
await expect(page.getByRole("button")).toBeEnabled();
await expect(page.getByRole("checkbox")).toBeChecked();

// URL
await expect(page).toHaveURL(/dashboard/);
```

## Test Authentication

### How It Works

E2E tests use a special test authentication mode enabled by `E2E_TEST_MODE=true`.

When enabled, requests with the `x-e2e-test-role` header are authenticated as test users:

```typescript
// In tests, this is handled by the fixture
const context = await browser.newContext({
  extraHTTPHeaders: {
    "x-e2e-test-role": "admin",
  },
});
```

### Test Users

| Role | Email | Name |
|------|-------|------|
| `admin` | admin@test.skintwin.local | Test Admin User |
| `salon_owner` | salonowner@test.skintwin.local | Test Salon Owner |
| `therapist` | therapist@test.skintwin.local | Test Therapist |
| `retail_customer` | customer@test.skintwin.local | Test Customer |

### Security

- Test auth **only** works when `E2E_TEST_MODE=true`
- Never enable in production
- Test mode is fail-closed (disabled by default)

## Running Tests

### Local Development

```bash
# Build first (required)
pnpm run build

# Run all tests
pnpm run e2e

# Run with visible browser
pnpm run e2e:headed

# Run with Playwright UI
pnpm run e2e:ui

# Debug specific test
pnpm run e2e:debug e2e/public.spec.ts

# Generate tests with codegen
pnpm run e2e:codegen
```

### Specific Browser

```bash
pnpm run e2e --project=chromium
pnpm run e2e --project=firefox
pnpm run e2e --project=webkit
pnpm run e2e --project=mobile-chrome
pnpm run e2e --project=mobile-safari
```

### Specific Tests

```bash
# By file
pnpm run e2e e2e/public.spec.ts

# By test name
pnpm run e2e --grep "home page renders"

# By tag
pnpm run e2e --grep "@smoke"
```

## CI Configuration

### Playwright Config

Key settings in `playwright.config.ts`:

```typescript
{
  // Parallel execution
  fullyParallel: true,

  // CI-specific retries
  retries: process.env.CI ? 2 : 0,

  // Timeout settings
  timeout: 60_000,
  actionTimeout: 10_000,
  navigationTimeout: 30_000,

  // Artifacts on failure
  trace: "on-first-retry",
  screenshot: "only-on-failure",
  video: "on-first-retry",
}
```

### Sharding

Tests are sharded in CI for parallelization:

```bash
# Shard 1 of 2
pnpm run e2e --shard=1/2

# Shard 2 of 2
pnpm run e2e --shard=2/2
```

## Debugging

### View Traces

```bash
# Show trace viewer for last run
pnpm exec playwright show-trace test-results/*/trace.zip
```

### View Report

```bash
# Open HTML report
pnpm exec playwright show-report
```

### Debug Mode

```bash
# Step through test
pnpm run e2e:debug

# Pause at specific line (add to test)
await page.pause();
```

### Screenshots

```bash
# Take screenshot in test
await page.screenshot({ path: "debug.png" });
```

## Test Categories

### 1. Public Page Tests (`public.spec.ts`)

- Home page rendering
- Marketing content visibility
- Navigation elements
- 404 page handling
- Console error checking
- Mobile responsiveness
- Page load performance

### 2. Dashboard Tests (`dashboard.spec.ts`)

- Role-based dashboard routing
- Navigation sidebar visibility
- Stats card rendering
- Quick action cards
- Unauthenticated access handling

### 3. Route Tests (`routes.spec.ts`)

- All route accessibility
- Protected route enforcement
- Page title verification
- Navigation between routes
- Error handling
- Console error checking per role

### 4. Interaction Tests (`interactions.spec.ts`)

- Dialog open/close
- Form input validation
- Tab switching
- Select controls
- Toast notifications
- Sidebar toggle
- Quick action navigation
- Logout flow
- Mobile responsive interactions
- Button loading states

## Best Practices

### Do's

1. **Use meaningful test descriptions**
   ```typescript
   test("admin can create new therapist", ...)
   ```

2. **Tag tests appropriately**
   ```typescript
   test.describe("Feature @smoke @dashboard", ...)
   ```

3. **Test user-visible behavior**
   ```typescript
   await expect(page.getByText("Success")).toBeVisible();
   ```

4. **Use role-based selectors**
   ```typescript
   page.getByRole("button", { name: /Submit/i })
   ```

5. **Handle async properly**
   ```typescript
   await page.waitForURL(/dashboard/);
   ```

### Don'ts

1. **Don't test implementation details**
   ```typescript
   // ❌ Bad
   expect(page.locator(".internal-class")).toBeVisible();
   ```

2. **Don't use arbitrary waits**
   ```typescript
   // ❌ Bad
   await page.waitForTimeout(2000);
   ```

3. **Don't rely on test order**
   ```typescript
   // Each test should be independent
   ```

4. **Don't hardcode viewport sizes in tests**
   ```typescript
   // Use projects in playwright.config.ts
   ```

## Troubleshooting

### Test Timeouts

Increase timeout for slow operations:

```typescript
test("slow operation", async ({ page }) => {
  test.setTimeout(120_000); // 2 minutes
  // ...
});
```

### Flaky Tests

1. Add `test.slow()` for inherently slow tests
2. Use proper waiting strategies
3. Add retries: `test.describe.configure({ retries: 2 })`

### Element Not Found

1. Check locator accuracy
2. Add wait for element: `await expect(locator).toBeVisible()`
3. Use more specific selectors

### Network Issues

```typescript
// Wait for network idle
await page.waitForLoadState("networkidle");

// Or wait for specific request
await page.waitForResponse(resp => resp.url().includes("/api/"));
```
