# Phase 2 specification

Status: implemented; see ACCEPTANCE.md for executed validation and remaining device/pilot limits. Assisted consent APPROVED 2026-10-10 by the founder's supplied Phase 2 addendum. Prior read-only-admin language is superseded for these narrow review actions. No live contact/SMS integration, legal certification, worker access or deployment is included.

## Ownership and migration

Preserve three projects/six independent npm modules. Admin owns migration 0002, requiring existing 0001. Customer API writes profiles, address books, adult recipient drafts, emergency contacts, consent/withdrawal requests and Care Circle invitations/memberships. Admin API exclusively claims/reviews/decides consent and independently confirms withdrawals; its projections exclude assistance notes/full addresses. Worker has no domain module/routes. Applications check the marker and never create indexes. Copy local contracts and test schema fixtures; do not import sibling runtime code.

New collections: customer_profiles, customer_addresses, care_recipients, recipient_consents, emergency_contacts, care_circle_memberships, care_circle_invitations, care_circle_invitation_artifacts, privacy_audit_events, assisted_consent_cases, consent_contact_attempts, consent_review_events, consent_staff_permissions, phase2_operations and phase2_rate_limits. All new records carry createdAt/updatedAt/version. Consent/review/privacy evidence has no TTL. Only transient invitation artifacts have a TTL; the invitation digest ledger remains to distinguish expired/replayed codes and retain audits. Authentication records and keys are preserved.

## Minimal product defaults

Profile: display name and preferred language; verified phone is read-only/masked. Address: India, label, two lines, locality/city/state, six-digit postal code, optional user-entered GeoJSON Point in longitude/latitude order. No inferred GPS. Recipient: display name, relationship, explicit adult confirmation, language/accessibility needs and optional short assistance preferences; no birth dates, clinical history, medications or government IDs. Recipients are distinct people and a record steward is not a legal guardian. Emergency contacts are records, not automatic users or permission grants. These minimal defaults are implementation choices; pilot notice/retention/authority policy is still pending professional review.

## Access matrix

| Actor                          | Allowed behavior                                                                                                      |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| CUSTOMER profile/address owner | Own data only, immutable verified phone                                                                               |
| Recipient STEWARD              | Own draft/detail, contact data, request consent, precautionary withdrawal request, invite/revoke/archive              |
| EDITOR                         | Approved shared recipient fields; contacts/notes only with the corresponding scope; cannot grant access or consent    |
| VIEWER                         | Approved shared recipient details/contact summaries only; no notes or mutation                                        |
| Ordinary ADMIN                 | Existing portal/auth only; no consent-review permission automatically                                                 |
| CONSENT_REVIEWER               | Redacted queue, atomic claim, bounded independent contact metadata/evidence and withdrawal confirmation for own cases |
| CONSENT_APPROVER               | Different identity reviews submitted protected evidence; explicit activation/decline/insufficient decision            |
| SUPPORT_VIEWER                 | MFA-protected redacted recipient status projections                                                                   |
| WORKER                         | No recipient, contact, consent or Care Circle access                                                                  |

Sharing queries include identity, ACTIVE status, unfrozen sharing, unexpired consent and field scope. Membership permissions are transactionally materialized in the recipient sharedWith field. Revocation/withdrawal clears it and invalidates pending invitations/current memberships. Mutations touch/version the recipient to serialize invitation acceptance against withdrawal. Lists never include assistance note plaintext/ciphertext. Detail notes are steward/editor-scope only; admin never receives them.

## Assisted consent

Recipients start PENDING_CONSENT (optional DRAFT). Case states: REQUESTED -> ASSIGNED -> CONTACT_IN_PROGRESS -> EVIDENCE_RECORDED -> PENDING_SECOND_REVIEW -> APPROVED/DECLINED/UNVERIFIED/NEEDS_MORE_EVIDENCE/LAWFUL_AUTHORITY_REVIEW_REQUIRED/CANCELLED. No generic activation endpoint. Expired open cases can be closed as expired when the steward creates a replacement; they cannot approve.

Reviewer/approver must have explicit grants, persisted active admin identity/membership, recent MFA and no recorded family conflict. Steward and any recorded Care Circle member cannot review that recipient; no case reassignment shortcut. Approval requires distinct identities, independently checked connected contact, reasonably established identity, independent communication, comprehension, category/purpose/withdrawal disclosure, affirmative scoped response, current notice and protected evidence references. Negative/pressured/unclear/absent evidence does not activate. Recipient need not have a phone app or CUSTOMER account. Staff enters actual independently obtained evidence; test fixtures are explicitly synthetic.

A family withdrawal request is not recipient attestation: it immediately freezes sharing/invitations as a precaution. An assigned reviewer can also receive a direct withdrawal contact through the staff intake route, freeze sharing and create an assigned withdrawal case without a family request. A claimed withdrawal case must independently verify contact before recording CONSENT_WITHDRAWN; cases close with CANCELLED / RECIPIENT_WITHDREW, not an activation. Sharing is never silently restored. New activation requires a new case. Inability to independently consent goes to LAWFUL_AUTHORITY_REVIEW_REQUIRED; Phase 2 has no lawful-authority approval.

Policy-configurable development defaults: 14-day case expiry, 30-day consent expiry, three contact attempts, five request/invitation operations per hour, 10-minute recent-MFA window. These are development controls, not legal retention periods. Notice version development-2026-10-10 describes family visibility/purpose and withdrawal. No TTL/deletion policy for evidence is invented.

## Encryption, retry and concurrency

AES-256-GCM uses random IVs, authenticated document/field context and versioned key envelopes. A dedicated Phase 2 keyring is configured in ignored customer/admin environment files without changing established auth keys. The private setup command generates/preserves it; missing keys fail closed. v1 is retained for digest continuity; new active versions encrypt new writes while prior decryption keys remain available. Contact channels, assistance notes, evidence references and idempotent responses are encrypted. Sensitive evidence is not placed in ordinary logs. Invitation raw tokens are returned only to the steward for private manual sharing; only keyed digests are in invitation records, and replay responses are encrypted. Request logs redact token path segments.

All mutations require Idempotency-Key UUID; updates/archive/contact/review changes include body version. Same key/body returns the same operation result without repeating effects; a different body conflicts. Resource permission is checked again before returning sensitive replay data. Stable createdAt/id cursor pagination defaults to 20, maximum 50. Soft archive preserves shared history.

Invitations last seven days, are accepted only by the intended already-verified CUSTOMER identity, and cannot expand approved scopes. Unknown/registered phone requests both return the same 202 shape and opaque code; unresolvable targets cannot redeem it. Acceptance/replay/expiry/revocation are checked server-side. No automatic delivery or account-existence disclosure.

Errors: 400 input, 401 auth, 403 scope, masked 404 inaccessible resource, 409 version/duplicate/replay, 410 expired invitation, 422 consent transition, 429 request/contact limit and 503 migration/key/dependency unavailable. Responses have request IDs and no-store; staff mutations preserve Origin/CSRF.

## Verification gates

Use unique local Mongo replica-set test databases only, never Atlas. Check migration idempotence, owner isolation, editor/viewer scopes, key/AAD tampering, duplicate/version/idempotency behavior, two-person/recent-MFA/permission/conflict checks, forged family evidence, no answer/unclear/incorrect identity, case/consent/invitation expiry, withdrawal/revocation and concurrent claims/acceptance. Cover customer forms/pending consent/invalid invitations/network recovery/logout in browser tests, admin review UI and worker auth regression. Native devices remain unverified until actually tested; the private mock OTP/LAN restriction remains recorded.
