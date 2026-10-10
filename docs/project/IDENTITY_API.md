# Phase 1 identity API contracts

This specification defines Phase 1 behavior. It does not by itself mean the endpoints are implemented or tested; see ACCEPTANCE.md for execution evidence. All routes retain the existing /v1 prefix and JSON request/error correlation.

## Mobile APIs

Customer uses CUSTOMER_LOGIN/CUSTOMER and its own issuer/audience; worker uses WORKER_LOGIN/WORKER and its own issuer/audience. E.164 phone input is explicit international form (+ followed by 8–15 digits); formatting spaces/dashes/parentheses are normalized. National-only numbers are rejected.

| Method/path               | Request                                     | Success                                                                             |
| ------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------- |
| POST /v1/auth/otp/request | phone, purpose                              | 202: challengeId, challengeToken, resendAfterSeconds, expiresInSeconds, maskedPhone |
| POST /v1/auth/otp/verify  | challengeId, challengeToken, six-digit code | 200: accessToken, refreshToken, expiresInSeconds, user                              |
| POST /v1/auth/refresh     | refreshToken                                | 200: rotated accessToken, refreshToken, expiresInSeconds, user                      |
| POST /v1/auth/logout      | Bearer access token                         | 204                                                                                 |
| POST /v1/auth/logout-all  | Bearer access token                         | 204; revokes sessions for this role/audience                                        |
| GET /v1/auth/me           | Bearer access token                         | 200: user                                                                           |

User contains id, role, maskedPhone and onboardingStatus. Worker status is PENDING_ONBOARDING; no approval/verification is implied. Full phone is not returned. OTP is never included in responses. Challenge credentials must be held in memory, not put in URL/query strings.

## Admin API

No registration route exists. Local provisioning creates a membership, password credential and MFA enrollment. ADMIN/SUPER_ADMIN only. Same-origin Next.js handlers relay admin requests and cookies; access/refresh credentials are never returned to browser JavaScript.

| Method/path                    | Request                                             | Success                                                             |
| ------------------------------ | --------------------------------------------------- | ------------------------------------------------------------------- |
| POST /v1/admin/auth/login      | phone, password; allowed Origin                     | 200: mfaChallengeId, mfaToken, expiresInSeconds; no session cookies |
| POST /v1/admin/auth/mfa/verify | mfaChallengeId, mfaToken, TOTP code; allowed Origin | 200: user and csrfToken; sets admin access/refresh HttpOnly cookies |
| POST /v1/admin/auth/refresh    | refresh cookie, allowed Origin, X-CSRF-Token        | 200: user and csrfToken; rotates cookies                            |
| POST /v1/admin/auth/logout     | access cookie, allowed Origin, X-CSRF-Token         | 204; revokes session and clears cookies                             |
| GET /v1/admin/auth/me          | access cookie                                       | 200: user and csrfToken                                             |

Cookie path is /, SameSite=Strict, HttpOnly for credentials, Secure on HTTPS. CSRF value is separate from credentials and bound to the session digest. Authentication has no public admin creation route. All protected admin content requires a persisted MFA-complete session. The old health diagnostic may stay public because it contains no personal or privileged data.

## Errors and replay

Uniform body: statusCode, code, message, requestId. Known codes: VALIDATION_ERROR (400), INVALID_CHALLENGE/INVALID_CREDENTIALS/INVALID_SESSION/MFA_REQUIRED (401), FORBIDDEN (403), RATE_LIMITED (429), AUTH_UNAVAILABLE (503). Expired, incorrect and used OTPs share INVALID_CHALLENGE; invalid admin first-factor responses do not distinguish unknown accounts. Throttling includes Retry-After.

OTP request is not idempotent: repeats within cooldown return 429. OTP/MFA verification is one-time, with atomic consumption. Expiry is checked in queries, not deferred to eventual TTL deletion. Refresh is not retry-idempotent: reuse of a previously accepted credential revokes the family, including access tokens; clients serialize refresh. Logout is an authenticated operation; attempting it with an already revoked token may return 401. No idempotency-key protocol is added in Phase 1.

Application boot does not create schema/indexes. Authentication returns 503 until infrastructure and migration version 0001 are available. Existing health remains a process-liveness contract and does not imply authentication or database readiness.

Reference implementation guidance: [MongoDB transactions](https://www.mongodb.com/docs/drivers/node/current/crud/transactions/), [Expo SDK 57 SecureStore](https://docs.expo.dev/versions/v57.0.0/sdk/securestore/), [RFC 6238](https://www.rfc-editor.org/rfc/rfc6238), [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken).
