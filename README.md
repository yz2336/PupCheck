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

## Project Structure

```
pupcheck/
├── app/                    # App Router pages + API routes
│   ├── api/                # Route handlers (auth, dogs, scans, chat, user)
│   ├── dashboard/          # Main hub
│   ├── scan/               # AI photo analysis
│   ├── chat/               # AI vet chat
│   ├── history/            # Full scan history
│   ├── settings/           # Account + dog management
│   └── onboarding/         # First-dog setup
├── components/             # Shared UI (Navbar, ScanResult, HealthChart…)
├── lib/                    # mongodb, cloudinary, openai, authOptions, rateLimit
├── models/                 # Mongoose schemas (User, Dog, Scan, ChatSession)
└── types/                  # Shared TypeScript types
```

## Features

- **Instant AI Scans** — 5 scan types (poop, ears, teeth, skin, eyes) with severity badges, concerns, and actionable recommendations.
- **Personalized Chat** — An AI vet assistant that knows your dog's breed, age, weight, and full scan history.
- **Health Trends** — Recharts timeline of every scan, color-coded by severity.
- **Multi-Dog Support** — One account, many pups.
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

## Notes

- Scan photos are sent to OpenAI as base64 data URLs and also stored in Cloudinary so the saved Scan document references a stable URL.
- Chat conversations send only the last 20 messages to OpenAI to stay within token limits.
- All protected routes enforce auth via `middleware.ts` (redirect to `/login`).
- Deleting a dog cascades to its scans and chat sessions.
