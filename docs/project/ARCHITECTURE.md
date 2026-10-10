# Current architecture

Phase 2 family data and assisted consent extends Phase 1 identity and Phase 0. Hire Me contains admin-panel, customer-app
and worker-app only. Each owns independent frontend and backend npm modules, manifests,
lockfiles, dependencies, source, tests, settings and CI. No shared runtime packages/imports.

| Project      | Frontend               | Frontend port | Independent NestJS API port |
| ------------ | ---------------------- | ------------- | --------------------------- |
| admin-panel  | Next.js 16 / React 19  | 3000          | 4000                        |
| customer-app | Expo 57 / React Native | 8081          | 4001                        |
| worker-app   | Expo 57 / React Native | 8082          | 4002                        |

Customer and worker pin Expo 57.0.27, React Native 0.86.3, React 19.2.3, SecureStore 57.0.4
and TypeScript 6.0.3. Expo Go must support SDK 57; restart Metro with --clear after upgrading.

## Data and ownership

Runtime backends retain the founder's Atlas configuration and database hire_me.
MONGODB_URL takes precedence over legacy MONGODB_URI; MONGODB_DB_NAME selects the database.
Private credentials/keys stay in ignored backend .env files, never EXPO_PUBLIC variables.

Global identities have a unique normalized E.164 phone. Customer and worker memberships
can coexist. Each API enrolls only its own mobile role. Admin membership is created only
by restricted provisioning. ADR 0004 defines collection ownership and the temporary shared
database credential limitation.

Admin owns migrations 0001/0002 and indexes. APIs check the required markers and never create indexes on
startup. Enrollment and MFA use replica-set transactions. OTP challenges, rate limits,
cooldowns, sessions and audit events are durable MongoDB data. TTL cleanup is asynchronous;
authorization checks expiry immediately.

Each API has its own RSA key, issuer, audience and key ID. Guards also validate persisted
identity, membership, session and MFA. Refresh rotation detects replay and revokes the
family. Mobile logout-all affects only its role/audience.

## Frontends

Admin uses a fixed-origin Next proxy and HttpOnly SameSite Strict cookies. Password login
issues only an MFA challenge; TOTP creates the session. The overview checks authentication
server-side. Origin and session-bound CSRF protect mutations. Browser-visible responses
contain no access/refresh tokens.

Mobile access tokens stay in memory. Native refresh uses Expo SecureStore; web preview
uses memory and needs sign-in after reload. Both apps have phone/OTP screens, loading/errors,
resend countdown, home, logout and expired-session recovery. Worker shows pending onboarding.

## Infrastructure

Admin backend owns Compose MongoDB 8 replica set rs0 and Redis 7.4 persistent volumes.
Dedicated loopback ports on this machine are 27018/6380 because defaults were occupied.
Unrelated services were preserved. Redis is ready for later phases; Phase 1 limits use MongoDB.

Integration/UI checks use uniquely named local test databases, never runtime Atlas hire_me.
Atlas connectivity/schema migration are separate operations recorded in ACCEPTANCE.md.

Unchanged /v1/health retains phase 0/version 0.1.0 for compatibility and means liveness only.
Swagger describes Phase 2 version 0.3.0 for admin/customer and retained Phase 1 version 0.2.0 for worker, with only the corresponding role routes.

Each module is an independent Git repository with its own .github/workflows/ci.yml.
There is no root Git repository or root workflow. GITHUB_REPOSITORIES.md maps all six
repositories and gives the clone layout. Publishing source to GitHub does not host the
services. ADR 0003 supersedes historical workspace instructions; ADR 0004 adds identity ownership.

## Phase 2 domain architecture - APPROVED 2026-10-10

Admin owns migration 0002 after 0001. Customer API owns profiles, addresses, adult recipients, contacts, customer consent/withdrawal requests, invitations and membership operations. Admin exclusively owns staff claim/contact/evidence/submit/decision and verified withdrawal operations. Worker has no FamilyModule or recipient routes. Domain source/contracts/fixtures are local copies in admin/customer modules, with module-role checks and no sibling runtime import.

Dedicated Phase 2 AES-256-GCM keys are shared privately by admin/customer without changing Phase 1 keys. Startup does not create indexes; service access requires the 0002 marker and valid keys. Unique open-case and idempotency indexes plus transactions/versioned recipient updates serialize approval, invitations, acceptance, revocation and withdrawal. TTL applies only to transient invitation artifacts. Authoritative consent and audit records have no invented TTL.

Customer screens use the existing authenticated mobile session, memory-only family data, no-store requests, stable pagination and periodic/foreground permission refresh; logout/background clears data. Admin /consent is server-session-protected and uses a fixed-origin allowlisted cookie/CSRF proxy. Explicit grants and recent MFA protect case contact/evidence; support exposes only redacted status. A new MFA login is required after the sensitive-action window; token refresh is insufficient.

See PHASE_2_SPEC.md, PHASE_2_API.md and ADR 0005 for the scope/access/state details. Read PHASE_2_HANDOVER.md for current setup and future boundaries.
