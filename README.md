# eTIMS Middleware

Asynchronous M-Pesa (Daraja) + KRA eTIMS middleware.

- `backend/` — Fastify + Prisma + BullMQ + PostgreSQL + Redis
- `frontend/` — Next.js 16 + Tailwind + TanStack Query

## Local Development

### 1. Start infrastructure (Docker)

    docker start mpesa-etims-postgres mpesa-etims-redis

### 2. Backend

    cd backend
    pnpm install
    pnpm prisma generate
    pnpm prisma migrate dev
    pnpm dev          # API on :3000

    # In a second terminal:
    pnpm worker       # BullMQ worker

### 3. Frontend

    cd frontend
    pnpm install
    pnpm dev          # UI on :3001

## Environment

Copy `.env.example` to `.env` in `backend/` and fill in your credentials.

## License

Proprietary