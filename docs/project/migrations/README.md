# Identity migrations and indexes

Admin backend is the sole runtime migration owner. From admin-panel/backend:

```powershell
npm.cmd run db:migrate
```

Migration 0001 lives in scripts/migrations/0001-identity.cjs. It creates required unique
identity-phone/role/admin-credential indexes, session owner/family indexes, challenge/limit/
session/MFA TTL indexes, 90-day security-event retention and a versioned migration record.
It requires a replica set or sharded database. Repeated execution reuses identical indexes
and the version record; it never seeds accounts or migrates inventory_db.

The migration is additive. There is no automatic down operation: dropping unique indexes
would weaken authorization assumptions and TTL removal can change retention. To revert a
development rollout, disable auth first and review data/index removal explicitly. Never
drop runtime databases or shared volumes as a routine rollback. Future schema changes
require a new versioned migration and documented forward/rollback constraints.

Customer/worker APIs do not create indexes at boot. They require marker 0001. Their local
test/fixtures/identity-schema.cjs copies initialize only uniquely named test databases,
under explicit test harness control; they are not runtime migration commands.
Tests refuse remote URLs. Infrastructure probes remove only their own temporary data.

Collection ownership is in ../adr/0004-identity-ownership.md.
Configured Atlas hire_me has migration 0001 applied as recorded in ../ACCEPTANCE.md.
