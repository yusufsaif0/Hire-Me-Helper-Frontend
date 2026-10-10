# GitHub repositories and local setup

Each frontend and backend is an independent Git repository and npm project. The Helper repositories contain the local worker-app modules. Keep the three-project layout when using the admin operator setup commands or frontend browser test scripts.

| Local folder          | GitHub repository                                                            | Port |
| --------------------- | ---------------------------------------------------------------------------- | ---- |
| admin-panel/backend   | [Admin Backend](https://github.com/yusufsaif0/Hire-Me-Admin-Backend)         | 4000 |
| admin-panel/frontend  | [Admin Frontend](https://github.com/yusufsaif0/Hire-Me-Admin-Frontend)       | 3000 |
| customer-app/backend  | [Customer Backend](https://github.com/yusufsaif0/Hire-Me-Customer-Backend)   | 4001 |
| customer-app/frontend | [Customer Frontend](https://github.com/yusufsaif0/Hire-Me-Customer-Frontend) | 8081 |
| worker-app/backend    | [Helper Backend](https://github.com/yusufsaif0/Hire-Me-Helper-Backend)       | 4002 |
| worker-app/frontend   | [Helper Frontend](https://github.com/yusufsaif0/Hire-Me-Helper-Frontend)     | 8082 |

## Clone on another machine

Run these commands from a new empty Hire Me directory:

```powershell
git clone https://github.com/yusufsaif0/Hire-Me-Admin-Backend.git admin-panel/backend
git clone https://github.com/yusufsaif0/Hire-Me-Admin-Frontend.git admin-panel/frontend
git clone https://github.com/yusufsaif0/Hire-Me-Customer-Backend.git customer-app/backend
git clone https://github.com/yusufsaif0/Hire-Me-Customer-Frontend.git customer-app/frontend
git clone https://github.com/yusufsaif0/Hire-Me-Helper-Backend.git worker-app/backend
git clone https://github.com/yusufsaif0/Hire-Me-Helper-Frontend.git worker-app/frontend
```

No package.json or node_modules is needed at the Hire Me root. Each repository includes its own manifest, lockfile, configuration, tests and GitHub Actions workflow. Project documents are packaged under docs/project in every module; backends retain their generated contract at docs/openapi.json. The packaged documents record the original development machine and historical acceptance results.

## Install and start

Use Node 22.13 or later. Inside each module, install independently and create a local environment file only when one does not already exist:

```powershell
npm.cmd ci --ignore-scripts
if (-not (Test-Path -LiteralPath .env)) { Copy-Item -LiteralPath .env.example -Destination .env }
```

Configure backend database credentials privately and use MONGODB_DB_NAME=hire_me for the existing shared database. For that database, restore the established authentication keys and Phase 2 keyring privately; generating replacement keys prevents reading existing encrypted data. GitHub does not store these private settings. A new empty development database can use the initial setup in PHASE_1_RUNBOOK.md followed by PHASE_2_HANDOVER.md. The admin auth:setup command expects all three backend .env files at the clone paths above; phase2:setup expects admin/customer .env files. Schema migrations belong to admin backend.

Start each backend and the admin frontend with npm.cmd run dev in separate terminals. Customer/helper browser previews use npm.cmd run web; native Expo development uses npm.cmd run dev -- --clear and Expo Go supporting SDK 57. Frontend .env.example files show the matching API addresses. Customer/helper device setup and verification limitations are recorded in DEVICE_VERIFICATION.md.

Run npm.cmd run check and npm.cmd run format:check inside each module. Backend integration checks and frontend browser suites need the local MongoDB replica set and use disposable databases. Start it from admin-panel/backend with npm.cmd run services:up. Frontend browser checks also expect the matching backend in the sibling backend folder. See PHASE_2_HANDOVER.md and ACCEPTANCE.md for existing verification and remaining work.

## Commit and push later changes

Run Git commands inside the module you changed:

```powershell
git status
git add .
git diff --cached --stat
git commit -m "Describe the change"
git push
```

.env files, private keys, dependency directories and generated output remain local. Commit .env.example with placeholder configuration and package-lock.json. Keep the module-local docs/project snapshot current when project documentation changes.

Publishing to these GitHub repositories uploads source code and enables their CI workflows. Hosting the APIs/admin website or distributing Android/iOS apps requires a separate deployment plan. Current mock integrations and production startup restrictions remain in place.
