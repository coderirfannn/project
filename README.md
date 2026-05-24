# Inventory Reservation System

Production-ready inventory reservation system built with Next.js 15, TypeScript, MongoDB Atlas, Mongoose, TailwindCSS, shadcn-style UI primitives, and Zod.

## Core Behavior

- Reservation requests decrement available stock atomically.
- Reservations expire after 10 minutes.
- Payment success confirms the reservation and permanently commits stock.
- Payment failure or expiration releases the reservation and restores inventory.
- Route handlers stay thin; the service layer owns business logic.

## Setup

1. Copy `.env.example` to `.env.local` and set `MONGODB_URI`.
2. Install dependencies with `npm install`.
3. Seed inventory data with `npm run seed`.
4. Start the app with `npm run dev`.

## Scripts

- `npm run dev` - start the Next.js dev server
- `npm run build` - build for production
- `npm run start` - start the production server
- `npm run seed` - load sample inventory data into MongoDB Atlas

## API Endpoints

- `GET /api/health`
- `GET /api/dashboard`
- `GET /api/inventory`
- `GET /api/reservations`
- `POST /api/reservations`
- `GET /api/reservations/:id`
- `POST /api/reservations/:id/confirm`
- `POST /api/reservations/:id/release`
- `POST /api/cron/release-expired`

## Deployment Notes

- Use MongoDB Atlas or another replica-set-backed MongoDB deployment so transactions are supported.
- Set `MONGODB_URI` in the hosting environment.
- Run the seed script or preload your own inventory collection before going live.
