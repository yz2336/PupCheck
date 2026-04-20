# PupCheck 🐶

AI-powered dog wellness dashboard. Upload photos of your dog's poop, ears, teeth, skin, and eyes for instant AI screening, chat with a virtual vet assistant, and track health trends over time.

> PupCheck is a screening assistant, not a replacement for a licensed veterinarian.

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Database**: MongoDB Atlas + Mongoose
- **Auth**: NextAuth.js (credentials provider, bcrypt)
- **AI**: OpenAI GPT-4o with vision
- **Image Storage**: Cloudinary (free tier)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Upload**: react-dropzone + camera capture on mobile

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description |
| --- | --- |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `OPENAI_API_KEY` | OpenAI API key (GPT-4o access required) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `NEXTAUTH_SECRET` | Random string — generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `http://localhost:3000` in development |

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Troubleshooting

### 1) App shows `404` unexpectedly in development

This usually means multiple stale `next dev` processes are running on different ports and one of them is serving a broken hot-reload state.

```bash
# Stop local dev servers on common ports
lsof -ti tcp:3000 tcp:3001 tcp:3002 tcp:3003 | xargs kill -9

# Clear Next.js build cache
rm -rf .next

# Start one clean server on a single port
npm run dev -- -p 3003
```

Then open `http://localhost:3003` and hard refresh (`Cmd+Shift+R`).

### 2) Sign-in page crashes with `TypeError: Cannot read properties of undefined (reading 'call')`

This is usually a corrupted Next.js dev bundle after repeated fast refreshes/port hopping (not a bug in the login form itself).

Use the same clean restart steps above (`kill` + `rm -rf .next` + fresh `npm run dev`) and verify:

```bash
curl -i http://localhost:3003/api/auth/session
curl -i http://localhost:3003/api/auth/providers
```

Both should return `200`.

### 3) Auth/register fails with MongoDB errors

If logs show `querySrv ECONNREFUSED _mongodb._tcp...`, your app cannot resolve/reach Atlas from the current network.

Checklist:

- Confirm Atlas cluster is running (not paused).
- Add your current IP in Atlas Network Access (or temporary `0.0.0.0/0` for testing).
- Verify DB user credentials and permissions in Atlas Database Access.
- Ensure `MONGODB_URI` is valid in `.env.local`.
- Ensure `NEXTAUTH_URL` matches your active local port (for example `http://localhost:3003`).
- Disable VPN/proxy/custom DNS temporarily or try another network/hotspot.

## Known Local Dev Gotchas

- **Port drift**: If `next dev` auto-switches ports, update `NEXTAUTH_URL` in `.env.local` to the same port.
- **Stale cookies after port changes**: Clear localhost site data/cookies if auth redirects behave strangely.
- **Multiple dev servers**: Run only one `next dev` instance at a time to avoid mixed hot-reload/runtime state.
- **Cache corruption symptoms**: Random `404`s, auth route runtime errors, or unexplained module errors usually mean `.next` should be cleared.
- **After `.env.local` edits**: Fully restart the dev server (hot reload does not always apply auth/env changes safely).

## Project Structure

```
pupcheck/
├── app/                    # App Router pages + API routes
│   ├── api/                # Route handlers (auth, dogs, scans, chat, share, export, reminders, wellness)
│   ├── dashboard/          # Main hub
│   ├── scan/               # AI photo analysis + printable report page
│   ├── chat/               # AI vet chat
│   ├── history/            # Full scan history
│   ├── compare/            # Side-by-side scan comparison
│   ├── share/              # Public shared report page
│   ├── reminders/          # Care reminders manager
│   ├── wellness/           # Wellness journal entries
│   ├── settings/           # Account + dog management
│   └── onboarding/         # First-dog setup
├── components/             # Shared UI (Navbar, ScanResult, HealthChart, ThemeToggle…)
├── lib/                    # mongodb, cloudinary, openai, authOptions, rateLimit
├── models/                 # Mongoose schemas (User, Dog, Scan, ChatSession, Reminder, WellnessEntry)
└── types/                  # Shared TypeScript types
```

## Features

- **Instant AI Scans** — 5 scan types (poop, ears, teeth, skin, eyes) with severity badges, concerns, and actionable recommendations.
- **Personalized Chat** — An AI vet assistant that knows your dog's breed, age, weight, and full scan history.
- **Health Trends** — Recharts timeline of every scan, color-coded by severity.
- **Compare Reports** — Side-by-side comparison workflow to spot changes between two scans.
- **Shareable Results** — Generate public share links for a dog's report and revoke access anytime.
- **Export + Print** — Export scan data and open printer-friendly scan reports for vet visits.
- **Reminders** — Create, update, and manage recurring care reminders per dog.
- **Wellness Journal** — Log wellness entries over time and review trends with context.
- **Multi-Dog Support** — One account, many pups.
- **Improved UX** — Theme toggle, keyboard shortcuts, and updated navigation/dashboard flows.
- **Mobile-First** — Camera capture on phones, one-handed scan flow.
- **Rate Limited** — 20 scans/day, 50 chat messages/day per user (development default).

## API Overview

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create a new user account |
| `GET/POST` | `/api/dogs` | List / create dogs |
| `PUT/DELETE` | `/api/dogs/[id]` | Update / delete a dog |
| `GET/POST` | `/api/scans` | List / create scans (triggers AI analysis) |
| `GET` | `/api/scans/[id]` | Single scan detail |
| `POST` | `/api/chat` | Send a chat message |
| `GET/POST` | `/api/chat/sessions` | List / create chat sessions |
| `GET` | `/api/chat/sessions/[id]` | Load a session's messages |
| `PUT` | `/api/user` | Update profile / password |
| `POST/DELETE` | `/api/dogs/[id]/share` | Create / revoke a dog's public share slug |
| `GET` | `/api/share/[slug]` | Read public shared dog report data |
| `GET` | `/api/export` | Export scan records |
| `GET/POST` | `/api/reminders` | List / create reminders |
| `PUT/DELETE` | `/api/reminders/[id]` | Update / delete a reminder |
| `GET/POST` | `/api/wellness` | List / create wellness entries |
| `DELETE` | `/api/wellness/[id]` | Delete a wellness entry |

## Notes

- Scan photos are sent to OpenAI as base64 data URLs and also stored in Cloudinary so the saved Scan document references a stable URL.
- Chat conversations send only the last 20 messages to OpenAI to stay within token limits.
- All protected routes enforce auth via `middleware.ts` (redirect to `/login`).
- Deleting a dog cascades to its scans and chat sessions.
- Public share pages are intentionally read-only and resolved by slug via `/share/[slug]`.
