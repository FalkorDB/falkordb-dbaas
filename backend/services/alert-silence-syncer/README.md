# Alert Silence Syncer

Synchronizes active Alertmanager silences with ArgoCD Application resources in Kubernetes clusters. This service ensures that silenced alerts are reflected as ArgoCD Application resources, enabling automated alert suppression across managed clusters.

## Features
- Fetches active silences from Alertmanager
- Creates or updates ArgoCD Application resources for each active silence
- Deletes ArgoCD Applications for expired silences
- Integrates with Kubernetes, ArgoCD, and Alertmanager APIs
- Centralized logging and error handling

## Prerequisites
- Node.js (v18+ recommended)
- Access to Alertmanager, ArgoCD, and Kubernetes APIs
- Required secrets and environment variables configured (see `.env.example`)

## Setup
1. **Install dependencies:**
   ```sh
   pnpm install
   # or
   npm install
   ```
2. **Configure environment:**
   - Copy `.env` or `.env.example` and fill in required values.
   - Ensure `sa.json` (service account) is present if needed for API access.

3. **Run the service:**
   ```sh
   pnpm start
   # or
   npm start
   ```

4. **Run tests:**
   ```sh
   pnpm test
   # or
   npm test
   ```

## Project Structure
- `src/`
  - `index.ts` — Main entry point
  - `constants.ts` — Application constants
  - `logger.ts` — Logging utility
  - `types.ts` — TypeScript types/interfaces
  - `services/`
    - `alertmanager.ts` — Alertmanager API integration
    - `argocd.ts` — ArgoCD manifest generation
    - `k8s.ts` — Kubernetes API integration

## Environment Variables
See `.env` or `.env.example` for required configuration, such as API endpoints and credentials.

## Logging
Logs are output using the centralized logger. Adjust log level in the environment config as needed.