# Phase 2 API guide

Generated module-local backend/docs/openapi.json is the complete machine contract. Admin/customer specifications are version 0.3.0; worker remains 0.2.0. Health remains its compatible Phase 0 liveness shape. These APIs require configured Phase 2 keys and migration marker 0002.

All customer routes use the existing CUSTOMER bearer session. Admin routes use the existing MFA session cookie and explicit consent/support permission. Every response is no-store with an X-Request-ID; errors contain statusCode, code, message and requestId. Mutations require an Idempotency-Key UUID. Reuse the same key only for the same logical request/body; retain it for ambiguous network retries. Edits, archives, requests and review actions include the current body version. Reload after a 409. The server validates permission again on sensitive replay.

| Customer route under /v1/customer                              | Methods                    | Notes                                                                                    |
| -------------------------------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------- |
| profile                                                        | GET, PATCH                 | Own name/language; verified phone masked/read-only. Initial version is 0.                |
| consent-policy                                                 | GET                        | Current development notice and operational defaults                                      |
| addresses; addresses/:id                                       | GET/POST; GET/PATCH/DELETE | Owner-only, India address and optional [longitude, latitude] GeoJSON Point; soft archive |
| recipients; recipients/:id                                     | GET/POST; GET/PATCH/DELETE | Adult DRAFT/PENDING records; scoped detail and steward archive; never client activation  |
| recipients/:id/emergency-contacts; .../:contactId              | GET/POST; PATCH/DELETE     | Masked contact summaries, encrypted phone writes; no automatic account                   |
| recipients/:id/consent; .../assisted-consent-status            | GET                        | Minimal status/scopes/next step; no staff evidence or contact channel                    |
| recipients/:id/consent-requests; .../assisted-consent-requests | POST                       | Equivalent idempotent steward request, HTTP 202                                          |
| recipients/:id/consent-withdrawal-requests                     | POST                       | HTTP 202, immediate precautionary freeze and independent follow-up                       |
| recipients/:id/consent-withdrawal                              | POST                       | Rejects direct family attestation, HTTP 422; use request workflow                        |
| recipients/:id/care-circle                                     | GET                        | Steward can list members; others only their own membership                               |
| recipients/:id/care-circle/invitations                         | GET, POST                  | Steward only; POST requires active scoped consent, returns private opaque code, HTTP 202 |
| care-circle/invitations/:token/accept                          | POST                       | Empty strict body, intended verified identity only, single-use/unexpired/consent-gated   |
| recipients/:id/care-circle/members/:memberId                   | DELETE                     | Steward revokes with member version; cannot remove steward                               |
| recipients/:id/care-circle/invitations/:invitationId           | DELETE                     | Steward revokes pending access with invitation version                                   |
| privacy/activity                                               | GET                        | Authorized minimal audit entries                                                         |

| Admin route under /v1/admin | Methods | Notes                                                                                                                 |
| --------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------- |
| support/recipients          | GET     | SUPPORT_VIEWER, name initial/status only; no addresses, notes, proof or full phones                                   |
| consent-cases               | GET     | Scoped/redacted queue; optional validated state filter                                                                |
| consent-cases/:id           | GET     | Recent MFA; case access audited; contact only assigned reviewer, evidence only appropriate review participants        |
| consent-cases/:id/claim     | POST    | Atomic reviewer assignment; no reassignment shortcut                                                                  |
| .../contact-attempts        | POST    | Assigned reviewer, bounded minimal metadata; no voice integration                                                     |
| .../evidence                | POST    | Structured independent observations and protected reference identifiers; current notice/scopes                        |
| .../submit-review           | POST    | Locks recorded evidence for a different authorized approver                                                           |
| .../decision                | POST    | Distinct approver, recent MFA, sufficient affirmative evidence required for activation                                |
| .../withdrawal-intake       | POST    | Assigned reviewer records recipient contact receipt, creates assigned withdrawal case and immediately freezes sharing |
| .../withdrawal              | POST    | Assigned withdrawal reviewer confirms independent verified contact and records CONSENT_WITHDRAWN                      |

Staff mutations also require matching Origin and X-CSRF-Token for the current session. The Next browser proxy accepts only the documented paths/methods against the configured fixed API origin; it does not expose session credentials in JSON. A 403 RECENT_MFA_REQUIRED means a new authenticator login is needed, not automatic permission escalation.

List endpoints return `{items, nextCursor}`; pass `limit` (1–50, default 20) and opaque `cursor`. Access scopes are RECIPIENT_DETAILS, EMERGENCY_CONTACTS and ASSISTANCE_NOTES. Invitation scopes must be a subset of current recipient consent, with RECIPIENT_DETAILS included. VIEWER never receives assistance notes, even when that scope was selected. Existing membership scope changes use revoke and issue a new scoped invitation.

Errors: 400 invalid/strict input or missing idempotency key; 401 authentication; 403 permission/field scope/wrong invitation identity; masked 404 inaccessible record/case; 409 version/idempotency/duplicate/open case/used invitation; 410 expired invitation; 422 invalid transition/insufficient independent evidence/consent required; 429 request/contact limit; 503 unavailable database/migration/key. Never turn these failures into optimistic ACTIVE/approved UI states.
