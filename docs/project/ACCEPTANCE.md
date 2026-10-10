# Phase 1 acceptance - 2026-10-10

Current evidence below supersedes historical Phase 0 limitations later in this file.

| Check                        | Actual result                                                                                                                                                                                        |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Six independent modules      | Preserved; only admin-panel/customer-app/worker-app at top level                                                                                                                                     |
| Infrastructure gate          | Docker rs0 primary, real transaction, Mongo/Redis persistent markers and reconnect after container restart passed                                                                                    |
| Atlas                        | Connection ping and admin-owned migration 0001 applied to hire_me; inventory_db unchanged                                                                                                            |
| Six module checks            | Lint, strict TypeScript, unit/HTTP tests and builds passed; see final verification record                                                                                                            |
| Unit/HTTP/client tests       | 57 passed: 14 per backend and 5 per frontend; no failures/skips                                                                                                                                      |
| Real Mongo integration       | 27 passed: 9 per backend; unique indexes, enrollment races, OTP expiry/attempts/one-time consumption, durable throttling, refresh races/reuse, logout/all, JWT/role/session checks, admin MFA/replay |
| Browser UI                   | All three passed against real local Mongo fixtures: login/error states, logout, server-revoked-session recovery; admin first-factor/MFA, HttpOnly cookies and CSRF                                   |
| Runtime accounts             | No default admin or test identity seeded into Atlas                                                                                                                                                  |
| Native Android/iOS           | NOT RUN; DEVICE_VERIFICATION.md records required checks                                                                                                                                              |
| Host reboot / backup restore | NOT RUN; container restart only was verified                                                                                                                                                         |
| Remote CI / deployment       | NOT RUN; module workflows prepared; no Git repository or remote deployment                                                                                                                           |

Tests create uniquely named local test databases and drop them afterward. Test-only OTP and
admin fixtures are unavailable outside the guarded test harness. The browser failure checks
intentionally cause 400/401/403 and an aborted network request; those are expected outcomes.

Health routes retain the original phase 0/version 0.1.0 liveness payload. OpenAPI version
0.2.0 documents role-specific Phase 1 auth. Mock SMS only; live integrations and production
startup are still rejected. One shared Atlas credential remains a temporary limitation
documented in SECURITY.md and ADR 0004.

## Expo SDK 57 upgrade verification - 2026-10-10

The two mobile frontends now use Expo 57.0.27 / React Native 0.86.3 / React 19.2.3 /
SecureStore 57.0.4 / TypeScript 6.0.3. Expo Go must support SDK 57. The earlier Phase 1
checks above also covered unchanged admin/backend modules; this upgrade rechecked the
customer and worker frontends and their browser flows.

| Check                        | Actual result                                                                                                                    |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| expo install --check         | Both passed against online Expo metadata                                                                                         |
| expo-doctor 1.20.4           | Both passed 21/21 checks                                                                                                         |
| Frontend checks              | Both lint, strict TypeScript, five unit/client tests each and web exports passed                                                 |
| Browser UI                   | Both passed invalid input/network/code states, resend countdown, real local Mongo sign-in, sign-out and revoked-session recovery |
| Native JS exports            | Android and iOS Hermes bundles passed for both apps using expo export --platform all; these are not native binaries              |
| Expo Go manifests            | Android/iOS development manifests for each app reported sdkVersion 57.0.0                                                        |
| Local dependency consistency | Each manifest, lockfile and module-local installation agree; six-module independent layout preserved                             |
| Native device runtime        | NOT RUN; adb listed no attached devices. SecureStore/device behavior remains subject to DEVICE_VERIFICATION.md                   |

UI fixtures used disposable local test databases. Expected negative browser checks produced
400/401 responses and intentionally aborted requests. Temporary test servers were stopped.
Use the updated PHASE_1_RUNBOOK.md to stop stale Expo servers and restart with --clear.

## Historical Phase 0 record

Everything below records earlier work and its then-current limits; it is not current
Phase 1 capability or verification status.

# Phase 0 acceptance

## Implemented scope

Customer/worker Expo starters, Next admin portal, three separate Nest backends, local contracts/config/UI in each module,
strict TypeScript, environment validation, UUID request correlation, OpenAPI generation,
mock provider registry, local Docker services, test runner, CI, README and ADR.

## Current independent-module verification

Verified on Windows with Node 22.18.0 and npm 10.9.3 on 2026-10-09.
Hire Me contains only admin-panel, customer-app and worker-app. Each project's frontend
and backend has its own package.json, package-lock.json, node_modules, TypeScript settings,
formatting/lint settings and workflow. There is no root workspace or shared dependency directory.

| Check                        | Result                                                                                          |
| ---------------------------- | ----------------------------------------------------------------------------------------------- |
| Six independent npm installs | Passed; dependencies resolve within their own modules                                           |
| npm run lint / typecheck     | Passed in all six modules after removing root dependencies                                      |
| npm test                     | Passed: 33 tests total, no failures or skips                                                    |
| npm run build                | Passed: three Nest backends, Next production build, two Expo web exports                        |
| npm run openapi              | Passed; backend/docs/openapi.json generated in each backend                                     |
| Standalone runtime check     | Passed: all three APIs simultaneously return their own identities, request IDs and Swagger docs |
| Independent shutdown         | Passed: stopping customer leaves admin/worker running; stopping admin leaves worker running     |
| Admin health proxy           | Passed: HTTP 200 with its backend running, HTTP 503 after that backend stops                    |

Runtime verification used temporary ports 4400/4401/4402 and 3300, with all test servers
stopped afterward. MongoDB/Redis Compose lives in admin-panel/backend and is shared by the
three backends through their environment settings. Database-backed domain features are not
implemented. Native device, browser visual, container runtime and remote CI checks remain
outside this local verification. Nested module workflows apply when the module is itself the
GitHub repository root; they do not run automatically from a parent repository.

## Follow-up recheck

Rechecked the independent layout, six manifest/lockfile matches and local dependency
resolution. All six lint, TypeScript, tests, build and formatting checks passed again.
Admin TypeScript also passed with generated Next files temporarily absent.

Started all three APIs and all three frontends on temporary local ports. Verified API
identities, CORS headers, UUID request headers, Swagger documents, Next home/proxy and both
Expo development web bundles with their corresponding API addresses. Verified independent
backend shutdown and admin rejection of offline or incorrect backend responses. All temporary
servers and worker processes were stopped; QA helper files were removed.

Fixed literal newline text in both mobile footers. Retained Expo's generated module-local
expo/tsconfig.base setting alongside the existing strict TypeScript options. Expo's offline
bundled dependency metadata check passed; online validation was not performed. Development
DevTools used their bundled fallback because the check ran offline.

Docker Compose configuration validates, but Docker Desktop is stopped. Database/Redis
container startup, native devices, browser visual/interaction QA and remote GitHub CI remain
untested. This is a working Phase 0 scaffold; business functionality is still pending.

## Earlier workspace verification (superseded)

The user's separate-backend structure is implemented: admin-panel, customer-app and worker-app
each contain frontend and backend. Verified locally with Node 22.18.0 and pnpm 11.11.0.

| Check                                    | Result                                                                                          |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------- |
| pnpm install --offline                   | Passed with the new workspace paths and all three backend manifests                             |
| pnpm install --frozen-lockfile --offline | Passed                                                                                          |
| pnpm build:shared                        | Passed                                                                                          |
| pnpm lint                                | Passed with zero warnings                                                                       |
| pnpm typecheck                           | Passed across all nine application/shared packages                                              |
| pnpm test                                | Passed: 19 tests, no failures or skips                                                          |
| pnpm build                               | Passed: three backends, Next production build and both Expo web exports                         |
| pnpm openapi                             | Passed: separate admin.json, customer.json and worker.json artifacts                            |
| Runtime backend smoke check              | Passed: all three simultaneously respond with their own service identities and documentation    |
| Independent shutdown                     | Passed: stopping customer leaves admin/worker available; stopping admin leaves worker available |
| Admin frontend routing                   | Passed: admin health response succeeds, then returns 503 when only admin backend is stopped     |

Runtime smoke checks used temporary ports 4400, 4401, 4402 and admin frontend port 3300.
Backend tests verify normal defaults 4000/4001/4002, independent origin configuration and the
same MongoDB URI/database settings. Frontend contracts reject a response from the wrong backend.
MongoDB settings are prepared; domain persistence is not implemented or verified.

## Original setup execution record

The following records the earlier single-backend setup, before the user's restructure request.

Verified locally on Windows with Node 22.18.0 and pnpm 11.11.0 on 2026-10-09.

| Check                                    | Result                                                                               |
| ---------------------------------------- | ------------------------------------------------------------------------------------ |
| Dependency installation                  | Passed after recreating the workspace modules with the final configuration           |
| pnpm install --frozen-lockfile --offline | Passed using the workspace-local cache                                               |
| pnpm build:shared                        | Passed for configuration and contracts                                               |
| pnpm lint                                | Passed with zero warnings                                                            |
| pnpm typecheck                           | Passed for all seven application/shared packages                                     |
| pnpm test                                | Passed: seven tests, no failures or skips                                            |
| pnpm build                               | Passed: API/shared packages, Next production build, both Expo web exports            |
| pnpm format:check                        | Passed                                                                               |
| pnpm openapi                             | Passed; docs/openapi.json generated from the actual Nest controller                  |
| docker compose config --quiet            | Passed                                                                               |
| Runtime HTTP smoke check                 | Passed: API health and UUID header, Swagger UI and JSON, admin home and health proxy |
| Health proxy failure path                | Passed: returns HTTP 503 when the API is stopped                                     |
| pnpm dev                                 | Passed: API and admin startup; both endpoints respond successfully                   |
| Expo dependency check (both apps)        | Passed against offline metadata; online validation not performed                     |

Tests cover invalid ports/origins, rejection of production mocks/live integrations, shared health
schema failures, security headers, UUID preservation/replacement, correlated errors and the
implemented OpenAPI route list. Runtime HTTP checks used temporary local servers.

## Limits

Native Android/iOS signing and physical-device behavior require device/toolchain testing.
Docker Desktop was not running. Container startup, replica-set initialization and Redis runtime
health were not executed; only Compose configuration was validated.
Browser visual/interaction QA and mobile device execution were not performed in this session.
Remote GitHub Actions execution requires this project to be pushed to a GitHub repository.
Domain authentication, bookings, payments and incidents are outside Phase 0.

## Atlas configuration update

The founder supplied an Atlas connection URL and requested a new database name. All three
ignored backend .env files now select hire_me; .env.example contains placeholders only.
MONGODB_URL input is validated and normalized to the internal MONGODB_URI configuration.
The previous MONGODB_URI input is still accepted. The default MONGODB_DB_NAME is hire_me.
One added test per backend checks Atlas URL acceptance, invalid URL rejection and the legacy
input. This raises backend tests to 10 per module (30 total; unchanged frontends have 6).
No connection to Atlas, database creation, collection write, inventory migration or database
rename was performed. The existing inventory_db was not modified. Domain persistence remains
unimplemented; the new name selects a different database for future operations.

Verified after the Atlas settings update: all three backend lint, TypeScript, build, formatting and OpenAPI checks passed; 30 backend tests passed. The actual ignored .env files validate and select /hire_me with MONGODB_DB_NAME=hire_me. A source/example/documentation scan found no copy of the Atlas password. No live Atlas connection check was performed.

## Final verification record - 2026-10-10

Executed on Windows, Node 22.18.0/npm 10.9.3:

- All six npm.cmd run check commands passed, including 57 unit/HTTP/client tests and builds.
- All six npm.cmd run format:check commands passed. Admin tsconfig formatting matches
  Next's generated JSON layout to keep type generation and formatting compatible.
- All three npm.cmd run test:integration commands passed: 27 tests, no failures/skips.
- All three npm.cmd run test:ui commands passed, including actual HTTP 204 logout,
  real Mongo sign-in/revocation, admin MFA and cookie/CSRF behavior.
- All three npm.cmd run openapi commands generated current 0.2.0 specs.
- Six manifests/lockfiles and module-local dependency locations verified.
- Compose config validated. Infra gate had passed real Mongo transaction/replica/persistence
  and Redis marker persistence after restarting the dedicated project containers.
- Atlas hire_me migration 0001, unique_phone index and schema owner verified read-only;
  runtime identities, sessions and admin credentials each had zero records.
- Public source/docs/example scan: 241 files, no matching private DB password or auth keys.
- Temporary test databases and UI server ports were clean after tests.
- Updated architecture/security/contracts/runbook/handover docs align across three projects.

Native devices, full host reboot, backups/restore, remote CI and deployment remain untested.

## Phase 2 verification record - 2026-10-10

This current record supersedes earlier Phase 0/1 scope and infrastructure limitations below; historical results are preserved.

| Check                                          | Result                                                                                                                                                                                              |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| All six module-local check commands            | Passed: lint, TypeScript, unit/HTTP/client tests, Next build and Expo web exports                                                                                                                   |
| Unit/HTTP/client tests                         | 58 passed: backend 14 each; frontend admin 5, customer 6, worker 5                                                                                                                                  |
| Local real-Mongo integration suites            | 73 passed: admin 32, customer 32, worker 9; 46 new family/security cases across local contract copies                                                                                               |
| Three browser UI suites                        | Passed: customer family forms/status/blocked invitations/offline retry plus logout/revocation; admin evidence/distinct approval/denials/support; worker unchanged auth                              |
| Formatting and docs                            | Six module format checks and synchronized current project documentation                                                                                                                             |
| Generated OpenAPI                              | Admin/customer 0.3.0 with domain requests/responses/errors; worker 0.2.0; health liveness unchanged                                                                                                 |
| Customer Android/iOS Hermes JavaScript exports | Passed to ignored .cache/phase2-native-export; no APK/IPA or device execution                                                                                                                       |
| Final structural/privacy checks                | Exactly three root folders, six local installed manifests/lockfiles, 290 public files without private values, synchronized current docs and valid local links; temporary test DBs/ports clear       |
| Private Phase 2 setup                          | Executed; keyring shared by ignored admin/customer settings; protected AUTH_/MONGODB_ hashes unchanged in all three backends                                                                        |
| Atlas migration 0002                           | Applied to existing configured hire_me; owner/marker/indexes verified; no test accounts/recipients seeded; original auth indexes unchanged                                                          |
| Local migration/security tests                 | Idempotence, auth-index preservation, note/key/AAD tampering, intended identity, versions/replays, field roles, two-person/recent-MFA/conflicts, evidence insufficiency and withdrawal races passed |

131 unit/integration tests in total; browser checks are separate suites, not included in that count. Tests use generated local databases and refuse remote test URLs. Actual verification occurred on Windows with Node 22.18.0/npm 10.9.3. API requests contain correlated errors/no-store; native device testing is not implied by passing browser tests.

### Observed happy and negative walkthroughs

The local browser harness walked the actual UI against real isolated MongoDB, with synthetic test identities/evidence. Customer signed in, edited profile, added an India address and adult recipient, requested independent consent, saw REQUESTED/PENDING CONSENT with sharing blocked, saved a masked emergency contact and recovered from an interrupted profile request. Invitation acceptance by an unavailable/wrong target was denied. Logout returned 204 and server-revoked sessions returned to sign-in without retained family data.

Admin first factor produced only an MFA challenge. Invalid authenticator and missing CSRF were rejected. An ordinary admin's consent page displayed no access; explicitly granting fixture permissions enabled the redacted queue. Reviewer claimed the case, recorded independently checked connected-contact metadata, recorded scoped affirmative disclosure/comprehension evidence, and submitted. The same identity had no decision control and a forged approval request returned 403. A distinct authorized MFA identity approved; the audit timeline showed the transitions. Support showed a name initial/status and no recipient contact phone. Worker login/errors/logout/revocation stayed intact.

Visual evidence is kept only in ignored frontend/.cache/ui directories. No real person was contacted and synthetic fixture evidence was never saved to Atlas. Staff contact/evidence verification remains an actual human responsibility.

### Remaining boundaries

Physical Android/iOS execution, APK/IPA signing, the mock-OTP/LAN path, backups/restore, remote CI and deployment remain unverified. Native JavaScript export results are recorded separately and do not establish device behavior. Live SMS/voice/KYC, notifications, bookings, worker onboarding and payments are outside Phase 2. Pilot notice/retention/recording/accessibility/lawful-authority policy and separate database grants remain pending; no legal certification or production readiness is claimed.
