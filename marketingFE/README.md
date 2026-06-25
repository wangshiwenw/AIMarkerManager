# Marketing Frontend

Next.js 16 admin dashboard frontend for the marketing project.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui and Radix UI
- TanStack Query and TanStack Table
- Zustand
- npm

This frontend currently has no login system. The dashboard opens directly at `/dashboard/overview`.

## Getting Started

```bash
npm install
cp env.example.txt .env.local
npm run dev
```

Open http://localhost:3000.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run format
```

## Data

The current product and user pages use local Next.js route handlers under `src/app/api/*`.
Those route handlers still return mock data from `src/constants/mock-api*.ts`.

To connect the Java backend later, replace those mock calls with backend fetches or keep the
route handlers as a BFF layer.

## Docker

```bash
docker build -t marketing-frontend .
docker run -d -p 3000:3000 --name marketing-frontend marketing-frontend
```
