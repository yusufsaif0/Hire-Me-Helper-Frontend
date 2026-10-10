# Changelog

## 2026-10-10 - Phase 2 family data and assisted consent

Delivered customer profile/address/adult-recipient/contact/Care Circle APIs and Expo screens; restricted admin review queue/contact/evidence/distinct approval/withdrawal/timeline and support screens; admin-owned migration 0002 and versioned private family encryption. Preserved Phase 1 keys, auth and independent six-module architecture. Worker domain features unchanged. Founder-assisted consent APPROVED 2026-10-10; insufficient/lawful-authority cases stay blocked. Added local Mongo security/race tests, customer/admin browser walkthroughs, OpenAPI 0.3.0, ADR 0005 and current handover/spec/API documentation. See ACCEPTANCE.md for actual results and native/pilot limits. No deployment or Phase 3 work.

## 2026-10-10 - Updated planning handover and OTP instructions

Expanded PHASE_1_HANDOVER.md into a self-contained upload document covering authoritative
architecture requirements, all three user flows, current technology versions, shared Atlas
schema ownership, commands, actual test evidence, remaining work and a next-planning prompt.
Added CMD/PowerShell mock OTP retrieval instructions and the exact terminal output label.
Recorded the existing private CLI HOST=127.0.0.1 requirement and the unverified native/LAN
configuration path in the handover, runbook and device checklist.

Only documentation changed. Current handover/runbook/device/changelog copies are kept
consistent in all three project folders. Documentation formatting, relative file references
and credential-content checks are verified separately; application tests were not rerun
for this documentation-only update. Prior Phase 1/SDK 57 verification remains as recorded.

## 2026-10-10 - Expo SDK 57 upgrade

The customer and worker projects used SDK 55 while the installed Expo Go expected SDK 57.
Upgraded both independent frontends through SDK 56 to the latest stable SDK 57 release.
Pinned Expo 57.0.27, Metro runtime 57.0.16, SecureStore 57.0.4, React Native 0.86.3,
React/React DOM 19.2.3, React types 19.2.18 and TypeScript 6.0.3 in each manifest/lockfile.
The unit-test compile command now uses Node16 resolution and TypeScript 6's --ignoreConfig.

Changed customer/worker frontend package.json, package-lock.json and README.md, plus the
current ARCHITECTURE, IDENTITY_API, DEVICE_VERIFICATION, PHASE_1_RUNBOOK, PHASE_1_HANDOVER,
ACCEPTANCE and CHANGELOG documentation in each project. Historical Phase 0 records remain.

Validation: both Expo dependency checks and both Expo Doctor runs passed (21/21 each).
Both frontend checks passed, including ten unit/client tests total and web exports.
Android/iOS Hermes JavaScript exports passed for both apps. All four development manifests
advertised SDK 57.0.0. Both MongoDB-backed browser suites passed sign-in/error states,
sign-out and server-revoked-session recovery. Local package/lock/install versions agree.
Native phone/emulator execution is NOT RUN; no Android device was attached. JavaScript
exports are not APK/IPA builds. Restart old Expo servers with npm.cmd run dev -- --clear.

## 2026-10-10 - Phase 1 identity and access

Customer/worker sign-in now creates persisted role-scoped identity sessions through mock OTP.
The admin overview now requires password and non-replayed TOTP, with HttpOnly cookies/CSRF.
Six independent modules remain; no root/shared package was introduced.

Changed files in each backend:

- src/auth/settings.ts, contracts.ts, crypto.ts, repository.ts, service.ts, mock-sms.ts,
  http.ts, auth.module.ts, mobile.controller.ts and admin.controller.ts.
- src/app.module.ts, environment.ts, config/environment.ts, http.ts and openapi.ts.
- scripts/mock-otp.cjs and e2e-server.cjs; test/auth-crypto.test.cjs,
  test/integration/identity.test.cjs, test/fixtures/identity-schema.cjs and test/http.test.cjs.
- package.json/package-lock.json, .env.example, module README and .github/workflows/ci.yml.
- backend/docs/openapi.json regenerated; private .env holds generated keys and Atlas settings.

Additional admin backend files:

- compose.yaml, scripts/infra-check.cjs, setup-auth.cjs, migrate.cjs,
  migrations/0001-identity.cjs and provision-admin.cjs.

Admin frontend:

- src/auth/client.ts, browser.ts, server.ts; components/login-form.tsx, admin-session.tsx,
  workspace.tsx; app/login/page.tsx, app/page.tsx, app/api/admin/auth/[...action]/route.ts,
  app/globals.css; next.config.ts, tsconfig.json and .prettierrc.json.
- .env.example, package/lock, ESLint config, test/auth-client.test.cjs,
  test/contracts.test.cjs, scripts/ui-check.cjs and README.

Customer/worker frontends:

- App.tsx, app.json, src/auth/client.ts, contracts.ts, storage.ts and AuthScreen.tsx;
  src/components/FoundationScreen.tsx; package/lock, ESLint config, auth-client/contracts
  tests, scripts/ui-check.cjs and README.

Project documentation:

- AGENTS.md and README.md; docs/PRD.md, ARCHITECTURE.md, SECURITY.md, ACCEPTANCE.md,
  PHASE_PROMPTS.md, adr/0004-identity-ownership.md, IDENTITY_API.md,
  DEVICE_VERIFICATION.md, PHASE_1_RUNBOOK.md, PHASE_1_HANDOVER.md, migrations/README.md and this changelog.
- Admin's older PROJECT_HANDOVER.md is explicitly historical.
- Corrected corrupted punctuation in starter screens without changing branding.

Validation: 57 unit/HTTP/client tests and 27 real Mongo integration tests passed; three
browser suites passed. Six-module checks/builds, generated OpenAPI and final formatting
are recorded in ACCEPTANCE.md. Mongo/Redis persistence survived container restart.
Atlas ping and identity migration 0001 applied to hire_me; no runtime users seeded.
Native Android/iOS, remote CI, full host reboot, backup restore and deployment are untested.

Added dependencies only: MongoDB driver, jsonwebtoken/types, Expo SecureStore and browser
test tooling. Existing application framework versions were preserved. No profiles,
recipients, worker approval, booking, live SMS or payment implementation is included.
