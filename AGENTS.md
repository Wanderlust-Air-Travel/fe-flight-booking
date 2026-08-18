# Flight Booking — Frontend

Next.js 16 (React 19, TypeScript) flight booking web application.

## Tech Stack

- **Framework:** Next.js 16 with App Router
- **UI:** React 19, Tailwind CSS 4, Radix UI (shadcn-style components), Lucide icons
- **State:** Zustand for booking state management
- **Forms:** React Hook Form + Zod validation
- **Real-time:** Socket.IO client for flight seat updates and payment status
- **API:** Axios for REST calls to the backend

## Key Conventions

- Server Components by default; `'use client'` only when needed (hooks, event handlers, interactive state).
- All user input validated with Zod schemas before API calls.
- Booking state isolated in `store/useBookingStore.ts`.
- WebSocket events: `flight:{id}:seat-update`, `booking:{id}:payment-status`.
- Error boundaries and loading skeletons on all async pages.

## Agents

- Use **planner** for new feature planning.
- Use **code-reviewer** after writing new components or pages.
- Use **tdd-guide** before implementing complex business logic.
- Use **typescript-reviewer** for architectural refactors.