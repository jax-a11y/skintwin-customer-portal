# Ecosystem Position: skintwin-customer-portal

> This repository is part of the [SkinTwin-AI ecosystem](https://github.com/jax-a11y/skintwin-ecosystem-design).
> Its machine-readable manifest lives at [`.skintwin/manifest.json`](./.skintwin/manifest.json); the ecosystem-wide
> source of truth is the registry at `registry/ecosystem.json` in the hub repo.

**Layer:** business-apps · **Role:** customer-org-service

The SkinTwin Customer Portal is a multi-tenant B2B/B2B2C portal (React 19 + tRPC + Drizzle) serving four roles — retail customers, therapists, salon owners, and admins — with consultations, bookings, orders, payments, and commission tracking. Within the ecosystem it plays the Customer & Org Service role: it owns users, organizations, tenants, and authentication (WorkOS SSO with RBAC), and exposes them to other services behind the `/api/users/*` gateway prefix.

## Provides

- `user-api` — Users, organizations, tenants, roles (Customer & Org Service); issues JWTs validated at the gateway

## Consumes

- `cognitive-api` — Skin analysis, recommendations, personalization from the neuro-symbolic cognitive layer
- `integration-api` — Unified gateway to Wix/OpenCart/Shopify B2B: health, sync (appointments/clients/products), B2B companies
- `lms-api` — Courses, enrollment, progress, certification; xAPI/SCORM/LTI interop

## Events

Payload schemas live at `contracts/events/<topic>.schema.json` in the hub repo.

| Topic | Direction |
| --- | --- |
| `user.created` | publishes |
| `order.placed` | subscribes |
| `order.created` | subscribes |
| `order.paid` | subscribes |
| `appointment.created` | subscribes |
| `appointment.updated` | subscribes |
| `course.completed` | subscribes |
| `certification.awarded` | subscribes |

## Service discovery

Downstream services should be located via environment variables, not hardcoded URLs:

- `SKINTWIN_INTEGRATION_HUB_URL` — Base URL of the integration hub (default http://localhost:5000)
- `SKINTWIN_COGNITIVE_API_URL` — Base URL of the cognitive service (`/api/cognitive/*`)
- `SKINTWIN_LMS_API_URL` — Base URL of the LMS service (`/api/lms/*`)

## CI

CI runs via this repo's own `ci.yml` (pnpm install, `tsc --noEmit`, vitest, vite/esbuild build, Playwright e2e), plus a nightly e2e workflow — see [docs/CI.md](./docs/CI.md). The ecosystem also offers reusable `workflow_call` CI templates; see `ci/README.md` in the [hub repo](https://github.com/jax-a11y/skintwin-ecosystem-design).
