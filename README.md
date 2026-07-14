# Ecommerce Platform

Production-ready ecommerce platform built with Next.js, Drizzle ORM, and PostgreSQL.

## Tech Stack

### Frontend / API
- Next.js 15 (App Router)
- TypeScript
- Drizzle ORM
- PostgreSQL
- MUI
- Framer Motion
- Zustand
- TanStack Query
- React Hook Form + Zod

## Project Structure

```
frontend/               # Next.js app + app-router API routes
docker-compose.yml
.env.example
README.md
```

## Getting Started

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16+

### Setup

1. Install dependencies:
```bash
cd frontend && npm install
```

2. Copy environment file:
```bash
cp .env.example frontend/.env.local
```

3. Start with Docker:
```bash
docker-compose up -d
```

4. Run seed to populate database:
```bash
docker exec -i ecom-frontend-1 npx tsx seed.ts
```

5. Access the app:
- Frontend: http://localhost:3000
- API: http://localhost:3000/api/products

## Available Scripts (Frontend)

- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Drizzle Studio
