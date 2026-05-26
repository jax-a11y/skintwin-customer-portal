export type ShopifyAppModuleId = 'b2b_prm' | 'b2b2c_crm';

export interface ShopifyAppModule {
  id: ShopifyAppModuleId;
  title: string;
  description: string;
}

export const SHOPIFY_APP_MODULES: readonly ShopifyAppModule[] = [
  {
    id: 'b2b_prm',
    title: 'B2B PRM',
    description: 'Manage partner onboarding, salon relationships, territory assignment, and partner performance.',
  },
  {
    id: 'b2b2c_crm',
    title: 'B2B2C CRM',
    description: 'Unify end-customer profiles, orders, bookings, and care lifecycle across partner channels.',
  },
] as const;

export const SHOPIFY_APP_POSITIONING = {
  appType: 'shopify_app',
  primaryPlatform: 'Shopify',
  modules: SHOPIFY_APP_MODULES,
} as const;
