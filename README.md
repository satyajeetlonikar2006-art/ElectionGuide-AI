# 🗳️ ElectionGuide AI

> **A nonpartisan civic education platform powered by Google Gemini AI.**  
> Empowering every citizen to participate confidently in democracy.

![Node.js](https://img.shields.io/badge/Node.js-22-green?logo=node.js)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![Gemini](https://img.shields.io/badge/Google%20Gemini-AI-orange?logo=google)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-yellow?logo=firebase)
![Vitest](https://img.shields.io/badge/Tests-Vitest-green?logo=vitest)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Google Services Used](#-google-services-used)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Running Tests](#-running-tests)
- [Deployment](#-deployment)
- [Security](#-security)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI Chat Assistant** | Multi-turn conversations with Gemini, nonpartisan civic guidance |
| 🔄 **Smart Model Fallback** | 8-model fallback chain (lite → full) for 99.9% uptime |
| 🔐 **Google OAuth Login** | Firebase Authentication with Google sign-in |
| 💾 **Cloud Database** | Firestore for persisting chat history and quiz scores |
| 📊 **Interactive Dashboard** | Election countdown, quiz scores, voter readiness tracking |
| 📅 **Election Timeline** | 10-stage visual timeline with expandable details |
| ✅ **Voter Readiness Checklist** | State-specific registration checklist |
| 🧠 **Civic Knowledge Quiz** | 3 difficulty levels with scoring and history |
| 🗺️ **Find Your Info** | State-specific voter information lookup |
| 📱 **PWA Support** | Installable, works offline, responsive on all devices |
| 🔒 **Enterprise Security** | Input validation, XSS/SQL injection protection, rate limiting |

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18** | Component-based UI with hooks |
| **React Router v7** | Client-side SPA routing |
| **Tailwind CSS 3** | Utility-first responsive styling |
| **Framer Motion** | Smooth animations and transitions |
| **Lucide React** | Modern SVG icon library |
| **Vite 5** | Ultra-fast dev server and bundler |
| **Vite PWA Plugin** | Progressive Web App support |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js 22** | JavaScript runtime |
| **Express 4** | HTTP server and API routing |
| **express-rate-limit** | DDoS/abuse protection |
| **dotenv** | Secure environment variable loading |

### Testing
| Technology | Purpose |
|-----------|---------|
| **Vitest** | Fast unit and integration test runner |
| **React Testing Library** | Component testing with user-centric queries |
| **jsdom** | Browser environment simulation |

---

## 🔷 Google Services Used

### 1. Google Gemini AI (Core)
- **Multi-turn conversations** via `startChat()` with full conversation history
- **System instructions** for nonpartisan personality and prompt injection defense
- **8-model fallback chain** for maximum availability:
  - `gemini-2.5-flash-lite` → `gemini-2.0-flash-lite` → `gemini-3.1-flash-lite-preview` → `gemini-flash-lite-latest` → `gemini-2.5-flash` → `gemini-2.0-flash` → `gemini-flash-latest` → `gemini-3-flash-preview`
- **Automatic retry** with 1s delay between attempts
- **Instant skip** on 429/503 errors to avoid wasting time on overloaded models

### 2. Firebase Authentication
- **Google OAuth 2.0** sign-in via popup
- **Auth state persistence** across page reloads
- **AuthContext** React provider for app-wide auth state

### 3. Firebase Firestore
- **Chat message persistence** — conversations saved per user/session
- **Quiz result storage** — scores tracked over time
- **Server-side timestamps** for accurate ordering

### 4. Google Cloud Run (Deployment)
- **Containerized deployment** via Dockerfile
- **Auto-scaling** based on request volume
- **Environment variable injection** for API keys

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Client (React)                    │
│  ┌─────────┐ ┌──────┐ ┌────────┐ ┌──────┐ ┌──────┐│
│  │Dashboard│ │ Chat │ │Timeline│ │ Quiz │ │ Info ││
│  └────┬────┘ └──┬───┘ └────────┘ └──────┘ └──────┘│
│       │         │                                   │
│  ┌────┴─────────┴───────────────────────────┐      │
│  │   AuthContext  │  UserStateContext        │      │
│  │  (Firebase)    │  (localStorage)          │      │
│  └───────────────┬──────────────────────────┘      │
└──────────────────┼──────────────────────────────────┘
                   │  POST /api/chat
                   ▼
┌──────────────────────────────────────────────────────┐
│              Express Server (server.cjs)              │
│  ┌────────────┐ ┌──────────┐ ┌───────────────────┐  │
│  │ Security   │ │ Rate     │ │ Input Validation  │  │
│  │ Headers    │ │ Limiter  │ │ & Sanitization    │  │
│  └─────┬──────┘ └────┬─────┘ └────────┬──────────┘  │
│        └──────────────┼────────────────┘             │
│                       ▼                              │
│  ┌─────────────────────────────────────────────┐    │
│  │  Gemini Fallback Engine (8 models)          │    │
│  │  lite → lite → lite → lite → full → full →  │    │
│  └─────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18 ([Download](https://nodejs.org/))
- **Google Gemini API Key** ([Get one free](https://aistudio.google.com/apikey))
- **Firebase Project** (optional, for auth/database)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/satyajeetlonikar2006-art/ElectionGuide-AI.git
cd ElectionGuide-AI

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# 4. Build the frontend
npm run build

# 5. Start the server
npm start
# Open http://localhost:3000
```

### Development Mode

```bash
# Terminal 1: Start Vite dev server (hot reload)
npm run dev

# Terminal 2: Start API server
npm run server
```

---

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | ✅ Yes | Google Gemini API key |
| `PORT` | No | Server port (default: 3000) |
| `NODE_ENV` | No | `development` or `production` |
| `VITE_FIREBASE_API_KEY` | No | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | No | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | No | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | No | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | No | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | No | Firebase app ID |

> ⚠️ **Security:** Never commit `.env` to version control. It is already in `.gitignore`.

---

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (re-run on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run only unit tests
npx vitest run tests/validation.test.cjs

# Run only integration tests
npx vitest run tests/server.test.cjs

# Run only component tests
npx vitest run tests/components.test.jsx
```

### Test Coverage

| Test Suite | Tests | What's Covered |
|-----------|-------|----------------|
| `validation.test.cjs` | 30+ | Input validation, XSS/SQL injection, sanitization, session IDs |
| `server.test.cjs` | 15+ | API endpoints, error handling, session management |
| `components.test.jsx` | 15+ | UI constants, markdown formatter, React rendering |

---

## 🚢 Deployment

### Google Cloud Run

```bash
# 1. Build the frontend
npm run build

# 2. Deploy to Cloud Run
gcloud run deploy electionguide-ai \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="GEMINI_API_KEY=your_key_here"
```

### Docker

```bash
docker build -t electionguide-ai .
docker run -p 8080:8080 -e GEMINI_API_KEY=your_key -e PORT=8080 electionguide-ai
```

---

## 🔒 Security

| Layer | Protection |
|-------|-----------|
| **Input Validation** | Message length limits, type checking, HTML stripping |
| **XSS Prevention** | `<script>`, `<iframe>`, `javascript:` protocol detection |
| **SQL Injection** | `SELECT`, `DROP`, `UNION` keyword detection |
| **Rate Limiting** | 20 req/min on chat, 100 req/min on all APIs |
| **Security Headers** | `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `HSTS` |
| **API Key Security** | Server-side proxy — keys never exposed to client |
| **Prompt Injection Defense** | System prompt includes explicit injection rejection rules |
| **Session Sanitization** | Session IDs stripped of special chars, max 64 chars |

---

## 📡 API Reference

### `POST /api/chat`
Send a message to the AI assistant.

**Request:**
```json
{
  "message": "How do I register to vote?",
  "sessionId": "optional-session-id"
}
```

**Success Response (200):**
```json
{
  "response": "Great question! **Voter registration** is the first step..."
}
```

**Error Responses:**
| Status | Error | When |
|--------|-------|------|
| 400 | `empty` | Message is null/empty |
| 400 | `too_long` | Message exceeds 500 chars |
| 400 | `code_detected` | XSS/SQL injection detected |
| 429 | `rate_limited` | Too many requests |
| 500 | `server_error` | AI model failure |

### `GET /api/health`
Health check endpoint.

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2026-05-01T12:00:00.000Z",
  "activeSessions": 3,
  "modelsAvailable": 8
}
```

---

## 📁 Project Structure

```
ElectionGuide-AI/
├── server.cjs                 # Express server + Gemini AI integration
├── utils/
│   └── validation.cjs         # Input validation & sanitization module
├── tests/
│   ├── validation.test.cjs    # Unit tests — validation logic (30+ tests)
│   ├── server.test.cjs        # Integration tests — API endpoints (15+ tests)
│   └── components.test.jsx    # Component tests — UI & formatters (15+ tests)
├── src/
│   ├── App.jsx                # Root component with routing
│   ├── config/
│   │   └── firebase.js        # Firebase config (Auth + Firestore)
│   ├── contexts/
│   │   ├── AuthContext.jsx     # Google OAuth context provider
│   │   └── UserStateContext.jsx# Local user state (checklist, quiz, etc.)
│   ├── components/
│   │   ├── LoadingScreen.jsx   # Animated loading screen
│   │   └── layout/
│   │       ├── Navbar.jsx      # Desktop navigation
│   │       └── BottomBar.jsx   # Mobile bottom navigation
│   ├── pages/
│   │   ├── Dashboard.jsx       # Main dashboard with stats
│   │   ├── Chat.jsx            # AI chat interface
│   │   ├── Timeline.jsx        # Election timeline
│   │   ├── Checklist.jsx       # Voter readiness checklist
│   │   ├── Quiz.jsx            # Civic knowledge quiz
│   │   ├── FindInfo.jsx        # State voter info lookup
│   │   └── SavedAnswers.jsx    # Bookmarked AI answers
│   └── constants/
│       ├── copy.js             # UI copy and chat suggestions
│       └── stateData.js        # State-specific election data
├── Dockerfile                  # Container config for Cloud Run
├── .env.example                # Environment variable template
├── vitest.config.js            # Test configuration
├── tailwind.config.js          # Tailwind CSS config
├── vite.config.js              # Vite build config
└── package.json                # Dependencies and scripts
```

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with ❤️ for democracy · Powered by Google Gemini AI
</p>
