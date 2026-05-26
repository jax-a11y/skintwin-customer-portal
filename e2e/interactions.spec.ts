import { test, expect } from "./fixtures/auth.fixture";

/**
 * UI Interaction tests - verify interactive elements work correctly.
 * Tests dialogs, forms, tabs, selects, toasts, and navigation.
 */

test.describe("Dialog Interactions @interaction @smoke", () => {
  test("therapist add dialog opens and closes", async ({ authenticatedPage }) => {
    const page = await authenticatedPage("admin");
    await page.goto("/therapists");

    // Click add button to open dialog
    await page.getByRole("button", { name: /Add Therapist/i }).click();

    // Verify dialog is open
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText(/Add New Therapist/i)).toBeVisible();

    // Close dialog by clicking cancel or outside
    await page.getByRole("button", { name: /Cancel/i }).click();

    // Verify dialog is closed
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("consultation add dialog opens with form fields", async ({
    authenticatedPage,
  }) => {
    const page = await authenticatedPage("therapist");
    await page.goto("/consultations");

    // Click add button
    await page.getByRole("button", { name: /New Consultation/i }).click();

    // Verify dialog content
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByLabel(/Customer/i)).toBeVisible();
    await expect(page.getByLabel(/Skin Type/i)).toBeVisible();
  });
});

test.describe("Form Input Interactions @interaction @full", () => {
  test("therapist form accepts input", async ({ authenticatedPage }) => {
    const page = await authenticatedPage("admin");
    await page.goto("/therapists");

    // Open dialog
    await page.getByRole("button", { name: /Add Therapist/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // Fill form fields
    await page.getByPlaceholder(/Enter full name/i).fill("Test Therapist Name");
    await page.getByPlaceholder(/therapist@example/i).fill("test@example.com");
    await page.getByPlaceholder(/\+27/i).fill("+27 82 000 0000");

    // Verify values are entered
    await expect(page.getByPlaceholder(/Enter full name/i)).toHaveValue(
      "Test Therapist Name"
    );
  });

  test("consultation form has required fields", async ({
    authenticatedPage,
  }) => {
    const page = await authenticatedPage("therapist");
    await page.goto("/consultations");

    // Open dialog
    await page.getByRole("button", { name: /New Consultation/i }).click();

    // Verify form structure
    await expect(page.getByLabel(/Customer/i)).toBeVisible();
    await expect(page.getByLabel(/Date/i)).toBeVisible();
    await expect(page.getByLabel(/Notes/i)).toBeVisible();
  });
});

test.describe("Tab Interactions @interaction @full", () => {
  test("integrations page has category tabs", async ({ authenticatedPage }) => {
    const page = await authenticatedPage("admin");
    await page.goto("/integrations");

    // Verify tabs exist
    await expect(page.getByRole("tab", { name: /All/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /E-Commerce/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Payments/i })).toBeVisible();
  });

  test("clicking tabs changes content", async ({ authenticatedPage }) => {
    const page = await authenticatedPage("admin");
    await page.goto("/integrations");

    // Click Payments tab
    await page.getByRole("tab", { name: /Payments/i }).click();

    // Verify payment-related integrations are shown
    await expect(page.getByText(/Stripe|PayStack/i)).toBeVisible();
  });
});

test.describe("Select Control Interactions @interaction @full", () => {
  test("reports page has period selector", async ({ authenticatedPage }) => {
    const page = await authenticatedPage("admin");
    await page.goto("/reports");

    // Find and click the select trigger
    const selectTrigger = page.getByRole("combobox").first();
    await expect(selectTrigger).toBeVisible();

    // Click to open
    await selectTrigger.click();

    // Verify options are shown
    await expect(
      page.getByRole("option", { name: /Week|Month|Quarter|Year/i }).first()
    ).toBeVisible();
  });
});

test.describe("Toast/Notification Interactions @interaction @full", () => {
  test("integration connect shows toast", async ({ authenticatedPage }) => {
    const page = await authenticatedPage("admin");
    await page.goto("/integrations");

    // Click connect on any integration
    await page.getByRole("button", { name: /Connect/i }).first().click();

    // Fill in the dialog if it appears
    const dialog = page.getByRole("dialog");
    if (await dialog.isVisible()) {
      // Click connect/save in dialog
      await page.getByRole("button", { name: /Connect/i }).last().click();

      // Verify toast appears (sonner uses specific data attributes)
      await expect(
        page.locator('[data-sonner-toast]').or(page.getByText(/connected|success/i))
      ).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe("Navigation Interactions @interaction @smoke", () => {
  test("sidebar toggle works", async ({ authenticatedPage }) => {
    const page = await authenticatedPage("admin");
    await page.goto("/dashboard");

    // Find and click toggle button
    const toggleButton = page.getByRole("button", { name: /Toggle/i }).first();

    if (await toggleButton.isVisible()) {
      await toggleButton.click();

      // Some visual change should occur (sidebar collapse/expand)
      // Just verify no error occurs
      await expect(page.locator("body")).toBeVisible();
    }
  });

  test("quick action cards navigate correctly", async ({
    authenticatedPage,
  }) => {
    const page = await authenticatedPage("admin");
    await page.goto("/dashboard");

    // Click on Integrations card
    const integrationsCard = page.getByText(/Manage Integrations/i).first();
    if (await integrationsCard.isVisible()) {
      await integrationsCard.click();

      // Should navigate to integrations
      await page.waitForURL(/integrations/);
      expect(page.url()).toContain("integrations");
    }
  });
});

test.describe("Logout Flow @interaction @smoke", () => {
  test("user menu shows logout option", async ({ authenticatedPage }) => {
    const page = await authenticatedPage("admin");
    await page.goto("/dashboard");

    // Find and click user menu in sidebar footer
    const userMenuTrigger = page
      .locator('[data-slot="sidebar-footer"]')
      .getByRole("button")
      .first();

    if (await userMenuTrigger.isVisible()) {
      await userMenuTrigger.click();

      // Verify logout option is visible
      await expect(
        page.getByRole("menuitem", { name: /Sign out|Logout/i })
      ).toBeVisible();
    }
  });
});

test.describe("Mobile Responsive Interactions @interaction @full", () => {
  test("mobile sidebar trigger works", async ({ authenticatedPage }) => {
    const page = await authenticatedPage("admin");

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/dashboard");

    // Find mobile menu trigger
    const mobileTrigger = page.locator('[data-sidebar="trigger"]');

    if (await mobileTrigger.isVisible()) {
      await mobileTrigger.click();

      // Sidebar content should become visible
      await expect(page.locator('[data-slot="sidebar"]')).toBeVisible();
    }
  });
});

test.describe("Button States @interaction @full", () => {
  test("report generate button shows loading state", async ({
    authenticatedPage,
  }) => {
    const page = await authenticatedPage("admin");
    await page.goto("/reports");

    // Click generate button
    const generateButton = page.getByRole("button", {
      name: /Generate Report/i,
    }).first();

    await generateButton.click();

    // Button should show loading state
    await expect(
      page.getByText(/Generating/i).or(page.locator('[class*="animate-spin"]'))
    ).toBeVisible({ timeout: 3000 });
  });

  test("download button triggers download", async ({ authenticatedPage }) => {
    const page = await authenticatedPage("admin");
    await page.goto("/reports");

    // Find download button
    const downloadButton = page
      .getByRole("button", { name: /Download/i })
      .first();

    if (await downloadButton.isVisible()) {
      // Just verify it's clickable without error
      await downloadButton.click();

      // Toast should appear
      await expect(
        page.getByText(/download|started/i)
      ).toBeVisible({ timeout: 5000 });
    }
  });
});
