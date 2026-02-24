# Web (Next.js)

This package contains the Life Prep Academy DMV website.

## Run locally

From the repo root:

```bash
npm install
copy .env.example .env
npm run dev:web
```

Open http://localhost:3000

### Required environment

This app proxies form submissions to Firebase HTTPS Functions via Next.js route handlers.

- `FUNCTIONS_BASE_URL` (server-side only)
	- Emulator: `http://127.0.0.1:5001/<projectId>/us-central1`
	- Deployed: `https://us-central1-<projectId>.cloudfunctions.net`

Firebase client env vars (`NEXT_PUBLIC_FIREBASE_*`) are also defined in `.env.example`.

## Build

From the repo root:

```bash
npm -w apps/web run build
```
