# Worker app frontend

Independent Expo SDK 57 / React Native frontend. Node 22.13+, module-local dependencies/settings.
Pinned versions: Expo 57.0.27, React Native 0.86.3, React 19.2.3 and TypeScript 6.0.3.

```powershell
npm.cmd ci --ignore-scripts
npm.cmd run dev -- --clear
```

Use ci for a fresh installation. Start matching backend separately on 4002.
Preview port 8082. Configure addresses using .env.example; preserve existing private files.
Use Expo Go compatible with SDK 57. After an upgrade, stop the old Expo server with Ctrl+C,
restart with the command above and scan the new QR code. --clear removes stale Metro cache.
Use npm.cmd run web for browser preview. Native devices need the computer LAN API address in EXPO_PUBLIC_API_URL. Native refresh uses Expo SecureStore; web preview credentials are memory-only and reload requires sign-in.

```powershell
npm.cmd run check
npm.cmd run format:check
npm.cmd run test:ui
```

check includes lint, TypeScript, five unit/client tests and Expo web export.
UI checks require the matching backend build, local MongoDB replica set and Chrome/Edge or
Playwright Chromium. They launch isolated servers and use disposable test identities.
Native Android/iOS remains untested; follow [device checklist](docs/project/DEVICE_VERIFICATION.md).

See [runbook](docs/project/PHASE_1_RUNBOOK.md) and [handover](docs/project/PHASE_1_HANDOVER.md).
No sibling runtime imports. Nested CI applies when this module is its own GitHub repository.

## Current Phase 2

Read [Phase 2 handover](docs/project/PHASE_2_HANDOVER.md), [domain specification](docs/project/PHASE_2_SPEC.md) and [API guide](docs/project/PHASE_2_API.md). Worker identity/pending onboarding is unchanged, with no recipient routes or features.

## GitHub setup

See [repository mapping and clone instructions](docs/project/GITHUB_REPOSITORIES.md). Private environment files are local only; use .env.example when setting up a new clone.
