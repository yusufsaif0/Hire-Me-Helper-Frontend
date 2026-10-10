# Phase 1: setup and testing

## Current machine

Dependencies and private auth keys are installed/configured. All three backends use Atlas
database hire_me. Migration 0001 is applied. No runtime admin or test customer/worker was
seeded into Atlas. Browser/integration fixtures use disposable local databases.

OpenAPI is served at http://127.0.0.1:4000/docs, :4001/docs and :4002/docs.
Never paste private .env files into ChatGPT or commit them.

## Fresh setup

Use Node 22.13+ and npm, with a terminal inside EACH of the six modules:

```powershell
npm.cmd ci --ignore-scripts
Copy-Item .env.example .env
```

Copy only if .env does not already exist. Configure each backend's private Atlas URL and
MONGODB_DB_NAME=hire_me. Configure frontend API addresses from its .env.example.
From admin-panel/backend run:

```powershell
npm.cmd run auth:setup
npm.cmd run db:migrate
npm.cmd run admin:provision
```

auth:setup is an operator convenience that generates/preserves keys in each of the three
backends' .env files. It imports no sibling runtime code. Each backend has independent RSA
and encryption keys; one digest key is initially generated for development. Migration
creates indexes and records version 0001, without creating default user accounts.
Provisioning requires a private interactive terminal. Enter your admin E.164 phone and
a unique 16–128 character password. Enroll the displayed otpauth URI in an authenticator.
Keep that seed private; it is not a public login credential.

## Start six modules

Open six terminals. From Hire Me, enter each folder separately and run npm.cmd run dev.

| Folder                | Start command inside folder | Preview/API           |
| --------------------- | --------------------------- | --------------------- |
| admin-panel/backend   | npm.cmd run dev             | http://127.0.0.1:4000 |
| admin-panel/frontend  | npm.cmd run dev             | http://localhost:3000 |
| customer-app/backend  | npm.cmd run dev             | http://127.0.0.1:4001 |
| customer-app/frontend | npm.cmd run web             | http://localhost:8081 |
| worker-app/backend    | npm.cmd run dev             | http://127.0.0.1:4002 |
| worker-app/frontend   | npm.cmd run web             | http://localhost:8082 |

Start backends before frontends. Restart backends after changing .env.
Use /v1/health for liveness. Successful health does not prove auth/database readiness.
Admin opens login until password and TOTP are verified. There is no public admin signup.

## Expo Go and SDK 57

Both mobile frontends use SDK 57. An SDK 55 project cannot open in Expo Go expecting
SDK 57. Dependencies and lockfiles are upgraded; use Expo Go compatible with SDK 57.
Stop any old Expo server with Ctrl+C. In each mobile frontend terminal, run:

```powershell
npm.cmd run dev -- --clear
```

Scan the newly displayed QR code for customer port 8081 or worker port 8082.
Use npm.cmd ci --ignore-scripts first only if installing this updated project on another
machine. --clear rebuilds Metro cache. Physical phones still require their matching
backend LAN URL and HOST=0.0.0.0; see DEVICE_VERIFICATION.md.

Compatibility and future upgrade reference: [official Expo upgrade guide](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/).

## Mock customer/worker OTP

Enter an international phone number and request a code in the corresponding app. In
development the OTP screen shows a challenge ID, not the working code or challenge secret.
In a separate PRIVATE interactive terminal inside the matching backend, copy only the
actual challenge ID, without surrounding text or punctuation. REPLACE_WITH_CHALLENGE_ID
in older examples is a placeholder and must not be passed literally.

For PowerShell:

```powershell
$otpChallengeId = Read-Host 'Paste the challenge ID from the app'
npm.cmd run auth:mock-otp -- $otpChallengeId
```

For CMD, run each line separately:

```cmd
set /p OTP_CHALLENGE_ID=Paste the challenge ID from the app:
npm.cmd run auth:mock-otp -- %OTP_CHALLENGE_ID%
```

The same terminal prints Development test code: followed by the six-digit OTP. This is
not sent as a real SMS. The command reveals the inbox message once; running it again
cannot retrieve that message. There is no fixed ordinary development OTP.

The command requires AUTH_ENABLED=true, NODE_ENV=development, HOST=127.0.0.1, an
interactive terminal and a current challenge from that same backend. Its generic error
is Mock code unavailable. Physical phone access requires a LAN-hosted backend, so the
private CLI/host configuration path must also be resolved and checked during native
verification; that path is currently unverified. See DEVICE_VERIFICATION.md.

Use the displayed code in the app within five minutes. The command consumes its encrypted
inbox file. A resend produces a new challenge after the 60-second cooldown.
Do not expect a real SMS. No API endpoint or ordinary response reveals the OTP.
Worker sign-in enrolls pending onboarding only; it does not approve a worker.

## Local infrastructure and automated checks

Atlas runtime does not require local Docker. Integration/UI checks DO require the dedicated
local replica set. From admin-panel/backend:

```powershell
npm.cmd run services:up
npm.cmd run infra:check
```

Private local configuration uses Mongo port 27018 and Redis port 6380. infra:check restarts
only this project's containers and verifies transactions and persistent markers; use it
when no other work depends on those containers. It deletes only its own probe database/key.
services:down stops containers but preserves named volumes. Do not use down -v casually.

Run in each module:

```powershell
npm.cmd run check
npm.cmd run format:check
```

Run in each backend:

```powershell
npm.cmd run test:integration
npm.cmd run openapi
```

Run in each frontend after building its matching backend:

```powershell
npm.cmd run test:ui
```

Integration tests use TEST_MONGODB_URL, default
mongodb://127.0.0.1:27018/?replicaSet=rs0&directConnection=true.
They refuse remote URLs and use only uniquely named temporary databases.
Browser checks need installed Chrome/Edge (or BROWSER_EXE); otherwise install Playwright's
Chromium with npx.cmd playwright install chromium. UI checks launch their matching API,
create a test-only identity fixture, run real browser/Mongo flows, and remove the database.
Ports: admin 3300/4410, customer 8381/4411, worker 8382/4412.
Admin test build files live in .cache/next-ui, isolated from the normal .next directory.
Screenshots are ignored under frontend/.cache/ui. Native checks are listed separately in
DEVICE_VERIFICATION.md and remain unexecuted.

## Configuration defaults

AUTH_ENABLED=false in examples; auth:setup sets true in private .env files.
AUTH_DIGEST_KEY/AUTH_ENCRYPTION_KEY are 64-character hex secrets. AUTH_PRIVATE_KEY and
AUTH_PUBLIC_KEY are base64 PEM RSA keys. Never regenerate keys casually after enrollment.

| Setting                   | Default |
| ------------------------- | ------- |
| AUTH_ACCESS_TTL_SECONDS   | 900     |
| AUTH_REFRESH_TTL_SECONDS  | 2592000 |
| AUTH_OTP_TTL_SECONDS      | 300     |
| AUTH_OTP_MAX_ATTEMPTS     | 5       |
| AUTH_RESEND_SECONDS       | 60      |
| AUTH_LIMIT_WINDOW_SECONDS | 600     |
| AUTH_PHONE_LIMIT          | 5       |
| AUTH_IP_LIMIT             | 20      |
| AUTH_ADMIN_LOGIN_LIMIT    | 10      |

Admin frontend API_BASE_URL points only at admin backend. ADMIN_FRONTEND_ORIGIN must match
the browser origin and backend CORS_ORIGIN. Mobile EXPO_PUBLIC_API_URL contains an API
address only. Retry-After is returned on throttling. AUTH_UNAVAILABLE/503 means disabled
auth, unavailable MongoDB or a missing migration. Browser reload intentionally signs out
the Expo web preview because its credentials are memory-only.
