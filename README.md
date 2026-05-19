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

Telegram Mini Apps require HTTPS. This guide walks you through creating a bot, setting
up a public tunnel to your local dev server, and opening the Mini App inside Telegram.

### Step 1 — Create a bot with BotFather

1. Open Telegram and search for [@BotFather](https://t.me/BotFather).
2. Send `/newbot` and follow the prompts:
   - **Bot name** (display name, can be anything): `Meetup Dev`
   - **Bot username** (must end in `bot`, unique): `meetup_dev_bot`
3. Copy the **bot token** BotFather gives you and put it in `.env`:
   ```
   TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234gh
   ```
4. Still in BotFather, send `/mybots` → select your bot → **Bot Settings** → **Menu Button**:
   - Set URL to your Mini App (you'll get this URL in Step 3).
   - Button text: `Open Meetup`

> **Tip:** Alternatively, send `/setdomain` to BotFather to link the Mini App domain
> to your bot, then use `https://t.me/meetup_dev_bot/app` as a direct link.

### Step 2 — Start local dev server

```bash
npm run dev
```

Verify it works: open http://localhost:5000 in a browser. You should see the greeting
page with a counter. Pressing the button won't work yet (Functions emulator needs to
be running), but the page should load.

### Step 3 — Create an HTTPS tunnel with ngrok

1. Sign up at [ngrok.com](https://ngrok.com) (free account is enough).
2. Follow the dashboard instructions to install and authenticate ngrok.
3. In a **second terminal**, start the tunnel:

   ```bash
   ngrok http 5000
   ```

   You'll see output like:
   ```
   Forwarding  https://abc123.ngrok-free.app -> http://localhost:5000
   ```

4. Copy the `https://abc123.ngrok-free.app` URL.

### Step 4 — Link the Mini App to your bot

1. Open [@BotFather](https://t.me/BotFather) → `/mybots` → select your bot.
2. Go to **Bot Settings** → **Menu Button** → **Edit URL**.
3. Paste the ngrok URL (e.g. `https://abc123.ngrok-free.app`).
4. Done. Go back to your bot's chat in Telegram and tap the menu button (left of the
   message input) → **Open Meetup**.

### Step 5 — Test the counter

1. The Mini App opens inside Telegram. You should see the greeting and counter.
2. Tap **Tap me!** — the counter should increment. The frontend calls `/api/counter/increment`,
   which Firebase Hosting proxies to the `api` Cloud Function, which writes to Firestore.

### Troubleshooting

| Problem | Fix |
|---------|-----|
| Page doesn't load in Telegram | Make sure `ngrok http 5000` is running and URL in BotFather matches |
| Counter shows `--` | Functions emulator might not be running — check `npm run dev` output |
| Button does nothing | Check Emulator UI at http://localhost:4000 for Firestore logs |
| BotFather rejects `localhost` URL | Use `127.0.0.1` instead, or better — use ngrok |
| ngrok "Too many connections" | Free tier limit. Restart ngrok or wait a few minutes |

### Debugging inside Telegram

Since Telegram WebView has no DevTools, use **Eruda** — a mobile console:

```html
<script src="https://cdn.jsdelivr.net/npm/eruda"></script>
<script>eruda.init();</script>
```

Add these two lines to `frontend/public/index.html` before testing. A debug button
appears on the page that opens a full DevTools panel inside the Mini App.

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
