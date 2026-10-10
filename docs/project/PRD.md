# Product requirements

## Current scope

Phase 0 foundation, Phase 1 identity and Phase 2 family records/assisted consent are delivered in the founder-required three projects and six independent npm modules. The startup blueprint is planning material; forecasts, pricing and competitor claims remain unvalidated. User instructions are authoritative. The Phase 2 assisted-consent addendum is APPROVED 2026-10-10 and supersedes prior read-only-admin/out-of-scope review language. See ADR 0003/0004/0005 and PHASE_2_HANDOVER.md.

Working brand: Trusted Assistance, a managed non-medical family/elderly assistance marketplace. Intended Delhi NCR pilot neighborhoods, staffing/capacity and brand clearance remain decisions. Customers may arrange support for themselves or consenting adult family members. No actual bookings are implemented.

Intended categories remain hospital visit escort, elderly companionship/check-in and station pickup/drop. Exclude clinical records, nursing, medication administration, intimate care, unsupervised childcare, medical emergency response, heavy lifting and overnight intercity escort. Existing service cards are illustrative static content.

## Delivered behavior

- Independent Next admin and Expo SDK 57 customer/worker frontends, each with a separate NestJS API, tooling and dependencies.
- MongoDB-backed Phase 1 identity/memberships/OTP/session rotation/revocation; restricted admin provisioning, passwords and real TOTP MFA; existing keys are preserved.
- Customer-owned name/language profile with verified masked read-only phone; India address book with optional explicit GeoJSON coordinates.
- Adult recipient drafts, record stewardship, emergency contacts as records and short encrypted non-medical assistance preferences. No automatic legal-guardian relationship or user enrollment.
- Staff-assisted independent consent requests/status, reviewer assignment, checked contact metadata, accessible disclosure/comprehension evidence, protected references and a different authorized second approver. The adult needs no customer account or smartphone.
- Explicit staff permissions, recent MFA, CSRF/Origin, conflict checks, auditable state transitions and fail-closed insufficient/no-answer/pressured/unclear/incorrect-identity evidence.
- Consent-scoped EDITOR/VIEWER Care Circle access, intended existing verified customer invitations, single use/seven-day expiry, revocation, stable pagination, version checks and idempotency.
- Immediate sharing freeze on withdrawal receipt/request, independently verified withdrawal and new-case-only reactivation. Inability to independently consent remains blocked in a restricted lawful-authority-review status; no automated authority approval.
- Customer family screens, staff review queue/detail/decision/timeline and redacted support views. Worker retains Phase 1 pending-onboarding behavior, with no recipient access.

Runtime writes persist in Atlas hire_me. Admin owns schema migrations 0001/0002; customer owns general domain/customer-request writes and admin owns restricted staff review/decision/withdrawal writes. Sensitive data and operation responses use a dedicated versioned encryption keyring. Detailed contracts, data minimization and development defaults are in PHASE_2_SPEC.md and PHASE_2_API.md.

## Remaining decisions and future work

Pilot privacy notice, evidence/recording/retention policy, lawful authority, disability accessibility and qualified Indian privacy/legal review remain pending. Development consent/case expiry controls are not legal retention periods. Two permitted staff identities and genuine independent human contact are necessary for actual approval; test fixtures are synthetic only.

Live SMS/voice/KYC, service catalog, zones, pricing/quotes, bookings, worker verification/training, dispatch, payments, notifications and incidents remain future work. No deployment or production readiness is claimed; mock-only production startup stays blocked. Native physical-device verification, backup/restore and separate DB service grants remain outstanding. Implement the next phase only when requested.
