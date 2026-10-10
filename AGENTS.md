# Module instructions

The user requires frontend and backend to be independent npm projects. Keep all module
configuration, dependencies, types and source code local. Do not recreate root workspace
files, node_modules, shared packages or cross-module runtime imports. Read docs/project/PRD.md,
docs/project/ARCHITECTURE.md, docs/project/SECURITY.md and docs/project/ACCEPTANCE.md before changes. Original
phase prompts and historical ADRs do not override the user's independent-module instruction.

Each backend uses its own port and service identity. MongoDB settings are shared for now,
and Phase 1 identity/session data is persisted per ADR 0004. Use mock integrations only. Production backend
startup remains blocked. Never log OTPs, sensitive notes, raw cards or identity numbers.
Implement only the requested phase and do not deploy without an explicit user instruction.
Run module-local npm scripts for lint, typecheck, tests and build. Backend changes require
regenerating backend/docs/project/openapi.json. Report untested items accurately.

Phase 2 assisted consent is APPROVED 2026-10-10. Read docs/project/PHASE_2_SPEC.md, docs/project/PHASE_2_API.md and ADR 0005. Customer owns domain/customer-request writes; admin owns explicitly permitted staff review/decision/withdrawal writes. Preserve two-person approval, recent MFA, versioned encryption keys, scoped sharing and immediate withdrawal freeze. Worker has no domain access. Do not seed test data into Atlas or start later phases without request.

Read docs/project/GITHUB_REPOSITORIES.md for the six-repository clone layout. Project documents are packaged in docs/project; backend/docs/openapi.json remains module-local. Run Git and npm inside this module.
