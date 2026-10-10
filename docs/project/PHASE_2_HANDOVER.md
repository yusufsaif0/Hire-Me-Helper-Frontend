# Hire Me: Phase 2 handover

Date: 2026-10-10. Current phase: Phase 2 family records and founder-approved assisted consent. This document supersedes the Phase 1 handover for current behavior; Phase 1 records remain historical. Validation and migration results are recorded in ACCEPTANCE.md. Phase 3 has not started.

## Architecture and technology

Hire Me contains exactly `admin-panel`, `customer-app`, and `worker-app`. Each contains independent `frontend` and `backend` npm projects with its own manifest, lockfile, dependencies, settings, tests and tooling. There is no root package, shared runtime package or cross-module runtime import. Similar contracts and test fixtures are deliberate local copies.

| Project  | Frontend                                        | API           | Ports       |
| -------- | ----------------------------------------------- | ------------- | ----------- |
| Admin    | Next.js 16.4.0, React 19.2.0                    | NestJS 11.2.7 | 3000 / 4000 |
| Customer | Expo 57.0.27, React Native 0.86.3, React 19.2.3 | NestJS 11.2.7 | 8081 / 4001 |
| Worker   | Expo 57.0.27, React Native 0.86.3, React 19.2.3 | NestJS 11.2.7 | 8082 / 4002 |

MongoDB driver 6.21.0 and Zod 4.6.5 are retained. No new framework or service dependency was needed. Runtime data uses the existing Atlas `hire_me` database. Each backend has independent authentication audiences/keys and role guards. Private settings stay in ignored backend `.env` files. Test fixtures use unique local MongoDB replica-set databases and random keys, never Atlas. Redis is retained for later use; these domain workflows use MongoDB transactions.

## What users can do

Customer: phone → mock OTP → verified customer session → profile/address book → add an adult family member → recipient stays PENDING_CONSENT → optional emergency contacts and short non-medical assistance preferences → request assisted consent with contact permission, accessible language, contact window and selected scopes → see minimal case status. The creator stewards the record and is not automatically a legal guardian. Emergency contacts receive no account or access automatically.

Staff: existing password → real authenticator MFA → Assisted consent → explicitly permitted reviewer claims a case → independently checks the contact channel and adult identity → explains purpose, categories, proposed family visibility, optionality, notice and withdrawal accessibly → records observed independent evidence and protected references → submits for second review → a different permitted staff identity approves or records a negative/insufficient outcome. No smartphone or customer account is required for the adult. Staff contact is manual; this application makes no calls or sends SMS.

Sharing: only approved, unexpired, matching recipient consent activates sharing → steward creates a seven-day invitation for an existing verified customer → privately shares the returned one-time code → only the intended signed-in identity accepts → EDITOR or VIEWER receives only approved scopes. Unknown and registered phone requests return the same response shape without revealing account existence. Stewards can revoke members/invitations. VIEWER cannot edit or see assistance notes. EDITOR needs explicit contacts/notes scope; it cannot grant access or attest consent.

Withdrawal: customer requests independent withdrawal follow-up → sharing/invitations freeze immediately as a precaution → assigned reviewer independently verifies the adult's withdrawal → recipient becomes CONSENT_WITHDRAWN. An assigned reviewer can also record a directly received withdrawal contact from an approved case and freeze sharing immediately, without needing a family request. Neither route silently restores sharing. New activation needs new independent evidence and second approval.

An adult unable to independently consent remains blocked in LAWFUL_AUTHORITY_REVIEW_REQUIRED. Automatic lawful-authority approval is deliberately absent until separately approved policy and evidence requirements exist. Declined or unverified cases allow a new independent request for correction/review.

Worker: its Phase 1 phone/OTP, pending-onboarding home, logout and revocation behavior remains. Worker has no recipient or Care Circle routes, onboarding, jobs or approval features.

## Data, permission and integrity

Admin owns additive migration 0002; migration 0001 and authentication keys/collections are preserved. APIs verify schema markers and do not create indexes on startup. Customer owns profile/address/recipient/contact/request/invitation/membership writes. Admin exclusively owns staff assignment, evidence, decisions and verified withdrawal. ADR 0005 documents this limited split.

The 15 new collections are documented in PHASE_2_SPEC.md. Every new row has timestamps and version. Unique indexes fence profiles, recipient memberships, open cases and idempotent operations. TTL applies only to transient invitation artifacts; consent, case and privacy evidence have no invented retention TTL. Invitation ledgers retain digests so expired/replayed codes are still rejected deterministically.

Strict input schemas reject editable verified phones, forged ACTIVE states and extra medical/identity fields. Scope and ownership are enforced in queries. Reviewer conflicts include stewards and recorded Care Circle members, including revoked memberships. Ordinary admins receive no consent permission automatically. Recent MFA is required for sensitive case access/actions. Origin and session-bound CSRF remain required for staff mutations.

Version checks prevent lost updates; UUID Idempotency-Key headers deduplicate identical retries. MongoDB transactions serialize invitation acceptance, access revocation and withdrawal. Sensitive operation responses are encrypted and current permission is rechecked before sensitive replay. Stable createdAt/id pagination is used; addresses, recipients and contacts soft archive.

AES-256-GCM with random IV, field/document authenticated context and a versioned dedicated Phase 2 keyring protects assistance notes, contact phones, contact preferences, evidence references and idempotent responses. Retain v1 for digest continuity and every old decrypt key when rotating; set a new active key only after distributing the complete ring to both backends. Missing keys/migration fail closed. No sensitive notes appear in generic lists, admin support, ordinary logs or persistent frontend storage. Mobile memory is cleared on logout/background; visible records refresh periodically, and shared access is checked by the server on every read. Previously viewed information cannot be recalled from a user or screenshot.

Development controls default to 14-day case expiry, 30-day consent expiry, three contact attempts, five requests/invitations per actor per hour and ten minutes of recent MFA. These are configurable controls, not legal retention periods. The development notice is version `development-2026-10-10`; pilot notice wording, accessibility, retention, recording and lawful authority remain pending qualified review.

## Run and configure

Do not run npm at the Hire Me root. Open each module in its own terminal and run `npm.cmd run dev`. Customer web preview uses `npm.cmd run web`; use Expo Go compatible with SDK 57 for native development. Keep existing Phase 1 keys; do not regenerate them to resolve a login error.

From `admin-panel/backend`:

```powershell
npm.cmd run phase2:setup
npm.cmd run db:migrate:phase2
```

Setup privately generates or preserves the shared Phase 2 keyring in ignored admin/customer settings. Migration requires existing 0001 and applies only 0002 to the configured database; no accounts or mock recipients are seeded. Read the recorded application result in ACCEPTANCE.md before rerunning. Restart admin/customer APIs after configuration changes.

Actual staff review needs two distinct real admin accounts. For accounts not yet provisioned, use the existing restricted `npm.cmd run admin:provision` interactive command. Then run the new command separately for each existing admin:

```powershell
npm.cmd run consent:permissions
```

The private development-only interactive CLI requires `HOST=127.0.0.1`, looks up an active admin, and grants reviewer, approver, both, support, or revokes consent permissions. Grants are audited. No default reviewer or approver is created. The two-person rule still applies when both accounts hold both capabilities. Sign in again with MFA when the recent-MFA window expires; refresh alone does not renew MFA.

SMS remains mock-only. Customer/worker dev sign-in displays the challenge identifier; in that module's backend, `npm.cmd run auth:mock-otp -- YOUR_CHALLENGE_ID` displays the one-time code privately in the CLI terminal. The CLI requires a local interactive terminal, development mode and HOST=127.0.0.1. The native/LAN workflow and real SMS are unverified/outside this phase; see DEVICE_VERIFICATION.md.

## Verification and changed files

Each module has `npm.cmd run check` and `npm.cmd run format:check`. Each backend has `npm.cmd run test:integration` and `npm.cmd run openapi`; each frontend has `npm.cmd run test:ui`. For isolated tests, start local infrastructure with `npm.cmd run services:up` from admin backend. Default loopback MongoDB is port 27018, replica set rs0; Redis is port 6380. Tests reject non-local URLs and remove only their generated test databases.

Acceptance records 131 passed unit/integration tests, all six module checks, three passed browser suites, formatting/OpenAPI/configuration/migration checks and observed browser walkthroughs. Customer Android/iOS Hermes JavaScript exports also passed; physical devices remain unverified. Native bundle exports are compilation checks, not physical device or APK/IPA execution. No native verification, deployment, remote CI, production SMS/voice/KYC or legal certification is claimed.

Key files: admin/backend `scripts/migrations/0002-family.cjs`, `setup-phase2.cjs`, `migrate-phase2.cjs`, `consent-permissions.cjs`; local admin/customer `src/family/` contracts/settings/store/services/controllers/responses/module; customer frontend `src/family/client.ts` and `FamilyHome.tsx`; admin frontend `components/consent-workspace.tsx`, `src/consent/client.ts`, `app/consent/page.tsx` and restricted consent proxy. Authentication is extended only to connect the customer screen to its existing session. Local integration fixtures, browser checks, generated OpenAPI and current docs are updated. Worker domain features remain unchanged.

## Next planning boundary

Phase 2 stops here. Propose the next phase separately after auditing current source and this acceptance record. Outstanding product decisions include pilot notice/retention/accessibility policy, lawful-authority process, deployment database grants, live authentication delivery, native device validation and staffing/contact procedures. Service catalog/booking/worker onboarding/dispatch/payments are future work requiring a new phase request.

Suggested planning prompt: “Read PHASE_2_HANDOVER.md, PHASE_2_SPEC.md, ADR 0005, PRD.md, ARCHITECTURE.md, SECURITY.md and ACCEPTANCE.md; audit actual source. Propose the next bounded phase without implementing it, preserving the three projects and six independent modules, existing auth keys, consent gates and database ownership.”
