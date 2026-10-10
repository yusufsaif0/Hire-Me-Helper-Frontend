# Current execution status

Phase 0, Phase 1 and Phase 2 are implemented in the founder-required six independent npm modules.
The Phase 0 monorepo text below is historical and superseded by ADR 0003. Phase 1 followed
the founder-supplied Hire_Me_Phase_1_Codex_Prompt.md with ADR 0004 and IDENTITY_API.md.
Current Phase 2 follows Hire_Me_Phase_2_Codex_Prompt_Approved_Assisted_Consent.md. The assisted-consent addendum is APPROVED 2026-10-10 and overrides older read-only admin plans. See PHASE_2_HANDOVER.md, PHASE_2_SPEC.md and ADR 0005 for current delivery and next planning. Do not execute later phases without request.

# Codex implementation prompts — Family & Elderly Assistance

## Global operating instruction

Read AGENTS.md and existing architecture. Plan, implement only the requested phase, update OpenAPI/README, add migrations and tests, run lint/typecheck/tests, report changes and risks. Do not deploy without approval.

## Phase 0

PHASE 0 — Create a pnpm TypeScript monorepo with apps/customer (React Native), apps/worker (React Native), apps/admin (Next.js), apps/api (NestJS), packages/contracts and packages/config. Add ESLint, Prettier, strict TS, Docker local services, CI, health endpoint, request IDs, env validation, test runner, ADR and AGENTS.md. Use mocked integrations only. Acceptance: clean install, build, lint, typecheck and tests pass.

## Phase 1

PHASE 1 — Implement phone OTP challenge/verify with rate limits and mocked SMS adapter, refresh-token rotation/revocation, user roles and RBAC policy guards. Use restricted local provisioning, scrypt password and real TOTP MFA; password alone never creates an admin session. Provide auth screens in both RN apps and contract tests. Never store plaintext OTP.

## Phase 2

PHASE 2 — Implement customer profile, recipient CRUD, explicit consent records, emergency contacts, encrypted sensitive notes, address GeoJSON, and scoped care-circle invitations. Create C05/C08/C09/C10/C24 screens and API tests including forbidden access and withdrawn consent.

## Phase 3

PHASE 3 — Implement service catalog, per-city zones, versioned service policies and pricing rules, coverage check, availability lookup and expiring quote snapshots in integer paise. Build C06/C07/C11/C12/C13. Add boundary tests for timezones, surcharge, expiry, rounding and unavailable areas.

## Phase 4

PHASE 4 — Implement booking aggregate and state machine, optimistic concurrency, bookingEvents append-only history, idempotency keys, outbox events, cancellation policy snapshot and admin-visible timeline. Build C16/C22/C23. Test race conditions and duplicate requests.

## Phase 5

PHASE 5 — Build worker onboarding W01-W05 and admin verification A04/A05. Use KYC provider adapter with sandbox mock, restricted document references, reviewer reason codes, training records and service eligibility expiration. Test that unapproved workers cannot accept jobs.

## Phase 6

PHASE 6 — Implement worker availability, hard-filter dispatch, offer expiry, assignment conflicts, manual dispatcher overrides with reason, W06-W09 and admin A02. Ensure atomic acceptance so two workers cannot win one offer. Include fair dispatch metrics.

## Phase 7

PHASE 7 — Implement payment gateway sandbox adapter, signed webhooks, idempotent payment state changes, double-entry ledger, refund approval flow, reconciliation jobs, worker earnings and payout batches. Build C14/C15/C28/W15/W16/A11-A13. Never handle raw card data.

## Phase 8

PHASE 8 — Implement worker arrival OTP, milestone checklist, event feed, authorized family visibility, incident/SOS endpoint and staffed escalation queue, W10-W14 and C17-C20/C27. Add offline milestone queue and location retention controls. Test consent revocation and incident escalation.

## Phase 9

PHASE 9 — Implement admin overview, operations board, support tickets, incident queue, role-scoped reporting, communication templates, audit trail and privacy request workflow. Build A01/A03/A06/A09/A10/A14-A18. Add audit tests for all sensitive admin actions.

## Phase 10

PHASE 10 — Execute security and resilience hardening: OWASP review, rate-limit abuse tests, backup restore rehearsal, queue retries, SLO dashboards, accessibility audit, localization, app lifecycle tests, API load tests and E2E happy/failure paths. Produce a launch-blocker report; do not mark untested items passed.

## Phase 11

PHASE 11 — Configure feature flags for a single pilot zone, production-like staging, operational runbooks, rollback plan, seeded demo accounts, deployment pipeline with approvals, smoke tests, store release checklist, incident drill and KPI dashboard. Do not deploy to production without explicit approval.
