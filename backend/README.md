# M-Pesa + KRA eTIMS Middleware

Async middleware: M-Pesa STK callbacks -> KRA eTIMS via BullMQ.

## Stack
- Node.js + TypeScript + Fastify
- Prisma + PostgreSQL
- BullMQ + Redis

## Quick Start
    pnpm install
    cp .env.example .env
    pnpm prisma:generate
    pnpm prisma:push
    pnpm dev
    pnpm worker