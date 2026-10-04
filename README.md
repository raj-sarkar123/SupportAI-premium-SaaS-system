# SupportAI SaaS

Full-stack SaaS application for AI-powered customer support.

## Project Structure

```
├── client/          # React + Vite frontend (port 8443)
├── server/          # Node.js + Express backend (port 4000)
├── package.json     # Root scripts to orchestrate both
└── .gitignore
```

## Prerequisites

- **Node.js** >= 18
- **PostgreSQL** running locally (or a remote connection string)

## Setup

### 1. Install dependencies

```bash
# From the root
cd client && npm install
cd ../server && npm install
```

### 2. Configure the server

```bash
cp server/.env.example server/.env
# Edit server/.env with your PostgreSQL connection string and a strong JWT_SECRET
```

### 3. Run database migrations

```bash
cd server
npx prisma migrate dev --name init
```

### 4. Start both apps

In **two separate terminals**:

```bash
# Terminal 1 — Client (port 8443)
cd client && npm run dev

# Terminal 2 — Server (port 4000)
cd server && npm run dev
```

## Environment Variables

### Client (`client/.env`)

| Variable       | Default                 | Description          |
| -------------- | ----------------------- | -------------------- |
| `VITE_API_URL` | `http://localhost:4000` | Backend API base URL |

### Server (`server/.env`)

| Variable        | Default                 | Description                  |
| --------------- | ----------------------- | ---------------------------- |
| `DATABASE_URL`  | —                       | PostgreSQL connection string |
| `JWT_SECRET`    | —                       | Secret for signing JWTs      |
| `JWT_EXPIRES_IN`| `7d`                    | Token expiry duration        |
| `PORT`          | `4000`                  | Server port                  |
| `CLIENT_ORIGIN` | `http://localhost:8443` | Allowed CORS origin          |

## API Endpoints

| Method | Path              | Auth | Description              |
| ------ | ----------------- | ---- | ------------------------ |
| POST   | `/api/auth/signup` | No   | Create a new account     |
| POST   | `/api/auth/login`  | No   | Login, sets httpOnly JWT |
| POST   | `/api/auth/logout` | No   | Clear the auth cookie    |
| GET    | `/api/auth/me`     | Yes  | Get the current user     |
| GET    | `/api/health`      | No   | Health check             |
