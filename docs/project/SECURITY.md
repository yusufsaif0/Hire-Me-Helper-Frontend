# Security and Phase 2 boundaries

## Implemented

- Production startup and live integrations remain blocked. Mock SMS only.
- Loopback defaults, Helmet, explicit CORS, UUID request IDs, generic errors and no-store responses.
- Logs contain method, path, status, request ID and duration; never request bodies, query
  strings, cookies, passwords, Authorization headers, OTPs or refresh secrets.
- Cryptographically random OTPs use keyed digests, five-minute expiry, five attempts,
  one-time consumption, 60-second cooldown and configurable persistent phone/IP limits.
  Verification requires a separate random challenge credential.
- Challenge phone values are encrypted. The development mock inbox is encrypted,
  expiring and read once through an interactive CLI. No HTTP OTP retrieval route exists.
  Automated capture/code injection requires explicit test mode.
- Unique phone/membership indexes and transactions handle concurrent enrollment.
- Separate RSA keys, issuers, audiences and key IDs plus persisted guards enforce role scope.
- Refresh secrets use keyed digests. Atomic rotation, used-secret tracking and family
  revocation detect reuse, including concurrent refresh. Clients serialize refresh.
- Restricted local admin provisioning requires a minimum 16-character password, salted
  scrypt hash and encrypted TOTP seed. No runtime default admin exists. Password success
  gives only an MFA challenge. TOTP attempts, one-time use and replay counters are enforced.
- Admin access/refresh cookies are HttpOnly, SameSite Strict and Secure for HTTPS.
  Exact Origin and session-bound CSRF protect mutations. Native refresh uses SecureStore;
  web credentials remain in memory with no localStorage/AsyncStorage fallback.
- Redacted security events record sign-in/revocation. Migration retention is 90 days,
  a development policy requiring launch review.

## Configuration and database limitation

Credentials/keys are in ignored .env files. Preserve keys across restarts; replacing them
invalidates tokens or prevents decryption of existing MFA/challenges. auth:setup preserves
existing keys. AUTH_ENABLED=false keeps unconfigured health available while auth returns 503. Setup and migration are required before signing in.

One founder-supplied Atlas credential is temporarily shared. Application isolation is
tested, but compromised DB credentials bypass application boundaries. Before deployment,
create separate migration/admin/customer/worker users and grants per ADR 0004. Shared
collection audience filters still need application enforcement. Compose is isolated local
development with an unauthenticated replica set.

Refresh reuse revokes a family even after duplicate requests or lost responses. Clients
must avoid concurrent refresh and reauthenticate after ambiguous retries. Session lifetime
is absolute from creation; access TTL is 900 seconds and refresh TTL 2592000 by default.
A maximum 4096 rotations bounds retained digests.

## Remaining verification

DEVICE_VERIFICATION.md is NOT RUN on Android/iOS. Browser checks do not prove native storage
security. Container restart persistence was checked; full host reboot, backup/restore,
external security review, remote CI and deployment remain untested.

Later phases require resource ownership, recipient consent/withdrawal, encrypted notes,
restricted document references, payments/webhooks, operational escalation and privacy
deletion. Static services are illustrative. Phase 1 does not verify workers, provide
emergency response, handle payments or establish production readiness.

## Phase 2 implemented safeguards - APPROVED 2026-10-10

Strict CUSTOMER membership/owner/recipient-scope queries protect all family APIs. Shared reads require ACTIVE/unfrozen/unexpired/matching consent. EDITOR writes require field scope; VIEWER has no mutation/assistance-note permission. Only the steward manages grants. Invitations are intended-identity bound, opaque-digest/single-use/seven-day-expiry records; responses do not reveal whether a target phone is registered. Logs redact invitation token path segments.

Admin consent capabilities are explicitly granted through an audited private CLI, never inferred from being admin. Cases are assigned atomically; no reassignment override exists. Stewards and recorded current/former Care Circle members are excluded. Sensitive case access/actions require recent persisted MFA, Origin/CSRF and role-specific permission. Activation additionally requires distinct reviewer/approver identities, independently checked connected contact, reasonably established identity, understandable voluntary affirmative response, disclosures/comprehension, approved scopes/current notice and protected references. Insufficient evidence/no answer/pressure/unclear identity cannot activate. Lawful-authority cases remain blocked.

Withdrawal requests and staff receipt freeze recipient sharing, revoke non-steward access and invalidate invitations transactionally; independent verification confirms withdrawal. Reactivation requires a new case. Cached mobile family data is memory-only and cleared on background/logout, refreshed periodically and removed after server access denial. Previously disclosed information or screenshots cannot be recalled. Server authorization is immediate; there is no push invalidation channel in Phase 2.

AES-256-GCM with random IVs, field/document authenticated context and versioned private keys protects notes, contact phones/preferences, evidence references and operation replay responses. Lists/admin support omit notes; evidence does not enter normal logs. Keep v1 for digest continuity and old keys for decryption when rotating. Malformed private key configuration fails with a generic error. Private setup preserves original AUTH_/MONGODB_ settings. Missing configuration/migration fails closed. Staff handles real contact outside the application; synthetic evidence exists only in isolated test fixtures.

A shared Atlas credential still grants more database access than the application boundaries. Separate least-privilege migration/customer/admin/worker users remain a pre-deployment task. Development notice, consent expiry, audit retention, accessibility and lawful-authority handling require qualified review before pilot. This workflow is not legal certification. No production SMS, calls, voice recording, KYC or deployment is enabled.
