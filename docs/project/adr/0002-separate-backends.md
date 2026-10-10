# ADR 0002: Separate backend for each frontend

Date: 2026-10-09. Status: accepted by explicit user instruction.

## Context

The user requested three top-level project folders, each divided into frontend and backend.
They explicitly requested separate backends for admin, customer and worker, while permitting
one shared MongoDB database for now. This instruction supersedes the original single-API layout.

## Decision

- admin-panel/frontend: Next.js; admin-panel/backend: NestJS, port 4000.
- customer-app/frontend: React Native/Expo; customer-app/backend: NestJS, port 4001.
- worker-app/frontend: React Native/Expo; worker-app/backend: NestJS, port 4002.
- Each backend owns its application source, startup configuration, tests and OpenAPI artifact.
- Each frontend connects only to its corresponding backend and verifies its health identity.
- Keep common schemas, settings and UI components in packages; no shared backend application.
- Configure the same local MongoDB URI and trusted_assistance database name for all three backends.

## Consequences

The backends can be started, stopped, built and extended independently. Their process defaults
do not conflict. The common package manager and utility libraries still simplify project maintenance.

Database persistence remains a later-phase task. Sharing a database will require explicit
collection ownership, migrations and authorization. There is no cross-backend business workflow
or service-to-service protocol in this foundation. Domain features remain outside this restructure.
