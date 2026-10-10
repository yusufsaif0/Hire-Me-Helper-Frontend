# ADR 0004: Identity ownership and Phase 1 authentication

Status: accepted implementation decision within the founder's Phase 1 request. Infrastructure verification is required before domain implementation. The existing six independent modules and Atlas configuration are preserved.

## Model and ownership

One E.164 phone identifies one global identity. CUSTOMER and WORKER memberships may coexist; neither grants administrator privileges. A unique phone index and transactions protect concurrent enrollment.

| Collection        | Schema/index owner  | Application writes                                                                                                                     |
| ----------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| identities        | Admin migration CLI | Customer/worker verification may atomically upsert identity and verifiedAt; status changes are reserved for admin operations           |
| role_memberships  | Admin migration CLI | Each mobile backend enrolls only its own role; ADMIN/SUPER_ADMIN are provisioned by restricted admin CLI only                          |
| otp_challenges    | Admin migration CLI | Each backend owns challenges for its audience/purpose; phone/code/challenge credentials are protected with keyed digests or encryption |
| sessions          | Admin migration CLI | Each backend creates, rotates and revokes only its audience's sessions                                                                 |
| auth_limits       | Admin migration CLI | Audience-prefixed IP/phone/login limits and resend cooldown; durable across restarts                                                   |
| admin_credentials | Admin migration CLI | Restricted provisioning; password hash and encrypted TOTP seed; admin authentication atomically advances accepted TOTP counter         |
| mfa_challenges    | Admin migration CLI | Admin first-factor and one-time second-factor verification only                                                                        |
| security_events   | Admin migration CLI | Append-only redacted authentication/revocation events; no OTP, tokens, passwords or raw phone/IP                                       |
| schema_migrations | Admin migration CLI | Versioned migration records; applications never create indexes on boot                                                                 |

The admin backend owns migration version 0001. Applications require its completion before authentication. Local integration tests use an explicitly named temporary test database on Compose, not Atlas hire_me or inventory_db. Runtime Atlas migrations are a separate documented command.

## Session and OTP decisions

- Each backend has a separate RS256 signing key, issuer, key ID and JWT audience. Access tokens last 15 minutes by default; refresh credentials last 30 days. Guards validate signature/claims plus persisted identity, membership, session and MFA status.
- Refresh credentials contain a random session ID and random secret; only keyed digests are stored. Atomic rotation preserves used digests for reuse detection. Concurrent refresh of the same credential permits at most one rotation and revokes the family on detected reuse. Clients serialize refresh requests.
- Logout-all is scoped to the current mobile role/audience and all its devices; it cannot revoke a different role's sessions through that API.
- OTP request returns a challenge ID and a random challenge credential, never the code. Verification needs both. Five-minute expiry, five attempts, 60-second resend cooldown and configurable phone/IP limits apply. Digests prevent ordinary database readers from guessing codes offline without a server key.
- Mock SMS is development-only. Automated tests inject an in-memory capture. Interactive local testing uses an encrypted, expiring module-local mock inbox and an explicit operator CLI; no public OTP retrieval route is provided. Codes are never written to application logs or returned to frontend clients.
- Admin is locally provisioned with a salted scrypt password hash and encrypted TOTP seed. First-factor success does not create an authenticated session. A fresh, non-replayed TOTP and one-time MFA challenge are required before any admin session exists.
- Admin sessions use HttpOnly SameSite Strict cookies. Cookie mutations require an exact allowed Origin and a session-bound CSRF header. Secure cookies are required for HTTPS/production; production startup remains blocked in this mock-only phase.
- Native mobile refresh credentials use Expo SecureStore. Web previews keep credentials in memory and require sign-in again after a page reload; there is no localStorage/AsyncStorage refresh-token fallback.

## Temporary development limitation

The founder supplied one Atlas database credential. It is retained in ignored backend environment files. This is a temporary development access limitation, not least-privilege deployment. Application tests must prove role/audience isolation even with a shared credential. Production remains blocked. Before deployment, provision separate Atlas database users/custom roles (or appropriate local MongoDB users) for migrations, admin, customer and worker; restrict each to the collections/actions above. MongoDB grants do not themselves enforce audience filters inside a shared collection, so application authorization remains mandatory.

## Contract and failure behavior

Exact endpoint schemas, delivery mechanisms, status/error codes and replay behavior are specified in ../IDENTITY_API.md before implementation. Invalid input is 400, missing/invalid credentials or replay is 401, wrong role is 403, throttling is 429 and unavailable/unmigrated infrastructure is 503. Errors preserve request IDs and do not expose credentials or account existence. No public admin registration, live SMS, profiles, bookings or payments are included.
