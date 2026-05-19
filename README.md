# Meetup

Telegram Mini App built on Firebase. Greeting page with a counter stored in Firestore, served via Cloud Functions and Firebase Hosting.

## Project structure

```
meetup/
├── frontend/public/       # Telegram Mini App (static HTML)
├── backend/functions/     # Firebase Cloud Functions (Express API)
├── database/              # Firestore rules & indexes
├── firebase.json          # Hosting, Functions, Firestore, Emulators
├── .firebaserc            # Project alias
└── package.json           # Root scripts
```

## Prerequisites

- Node.js >= 20
- Firebase CLI (`npx firebase-tools`)
- Firebase project with Blaze plan (Functions require it)
- Service account key at repo root: `meetup-barcher-firebase-adminsdk-fbsvc-*.json` (gitignored)

## Setup

```bash
npm install                     # root (firebase-tools)
cd backend/functions && npm install && cd ../..
cp .env.example .env            # fill in GOOGLE_APPLICATION_CREDENTIALS
```

## Local dev

```bash
npm run dev       # starts all emulators
```

| Service      | URL                                      |
|-------------|------------------------------------------|
| Frontend     | http://localhost:5000                     |
| Emulator UI  | http://localhost:4000                     |
| Functions    | http://localhost:5001 (proxied via /api/*) |
| Firestore    | localhost:8080                            |

## Test in Telegram

Telegram requires HTTPS. Tunnel your local server:

```bash
npx ngrok http 5000 --log=stdout
```

Paste the ngrok HTTPS URL as the Mini App URL in [@BotFather](https://t.me/BotFather).

The counter button hits `/api/counter` and `/api/counter/increment` — both proxied through Firebase Hosting to Cloud Functions. Works identically in emulators and production.

## Build

```bash
npm run build     # compiles TypeScript in backend/functions
```

## Deploy

```bash
npm run deploy              # deploy everything (hosting + functions + rules)
npm run deploy:functions    # deploy only Cloud Functions
npm run deploy:hosting      # deploy only frontend
```

## Logs

```bash
npm run logs     # tail Cloud Functions logs
```

## Database

- **Firestore**: `stats/counter` document (auto-created on first increment)
- **Rules**: read all, write authenticated only (`database/firestore.rules`)
