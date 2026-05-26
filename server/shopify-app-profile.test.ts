import { describe, expect, it } from "vitest";
import { SHOPIFY_APP_MODULES, SHOPIFY_APP_POSITIONING } from "@shared/shopifyAppProfile";

describe("Shopify app positioning", () => {
  it("should declare the product as a Shopify app", () => {
    expect(SHOPIFY_APP_POSITIONING.appType).toBe("shopify_app");
    expect(SHOPIFY_APP_POSITIONING.primaryPlatform).toBe("Shopify");
  });

  it("should include integrated B2B PRM and B2B2C CRM modules", () => {
    const moduleIds = SHOPIFY_APP_MODULES.map((module) => module.id);
    expect(moduleIds).toContain("b2b_prm");
    expect(moduleIds).toContain("b2b2c_crm");
    expect(SHOPIFY_APP_MODULES).toHaveLength(2);
  });
});
