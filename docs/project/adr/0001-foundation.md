# ADR 0001: Local Phase 0 foundation

Date: 2026-10-09. Status: original layout superseded by ADR 0002 at the user's request.

## Context

The folder contained one empty index.html. The user requested startup project setup using
Codex_Phase_Prompts.md and Trusted_Assistance_Startup_Blueprint.pdf. The prompts name
apps/api and packages/contracts; the blueprint also suggests services/api and packages/types.

## Decision

Follow the explicit Phase 0 prompt: pnpm, TypeScript, apps/customer and apps/worker
(React Native/Expo), apps/admin (Next.js), apps/api (NestJS), packages/contracts and
packages/config. Add packages/ui to share mobile starters and design tokens.
Use a modular monolith and local-only mocks. Pin the dependency graph in pnpm-lock.yaml.
Select Expo SDK 55, React Native 0.83 and React 19.2 together, Next 16, and Nest 11.
Use tsc for Nest decorator metadata, webpack for the Next build, and web exports as the
portable React Native build gate. Native binaries are a separate validation scope.
Remove the empty index.html because app entry points belong to each workspace.

## Consequences

A clean scaffold supports independent software phases without claiming operational readiness.
No domain persistence exists yet. Docker is prepared for MongoDB transactions and Redis.
The Phase 0 API cannot start in production. Deployments require a future explicit instruction.

## Compatibility references

- https://docs.expo.dev/versions/v55.0.0/
- https://expo.dev/changelog/sdk-55
- https://nextjs.org/docs/app/getting-started/installation
- https://docs.nestjs.com/

The supplied planning files are the product reference; competitor and pricing claims have
not been researched or endorsed during this implementation.
