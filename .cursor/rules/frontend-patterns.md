---
description: "Next.js 16, React 19, and frontend architecture patterns"
globs: ["**/*.tsx", "**/*.ts"]
alwaysApply: false
---

# Frontend Patterns

## Next.js 16 App Router

### Server vs Client Components

- Default to **Server Components** for data fetching, SEO-critical content, and static UI
- Add `'use client'` only when you need: hooks, event handlers, browser APIs, or interactive state
- Keep client boundaries as small as possible

```typescript
// Server Component (default)
export default async function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const flight = await fetchFlight(id);
  return <FlightDetails flight={flight} />;
}

// Client Component for interactivity
'use client';
export function SeatMap({ flightId }: { flightId: string }) {
  const { selectedSeat, setSelectedSeat } = useSeatSelection();
  // ...
}
```

### Data Fetching

- Use `fetch` with `cache` and `revalidate` options for server-side data fetching
- Use React's `use()` hook for promise handling in Server Components
- For client-side fetching, use `swr` or `react-query` with proper error states
- Always handle loading, error, and empty states

```typescript
// Server Component
const flight = await fetch(`/api/flights/${id}`, {
  next: { revalidate: 60 }, // ISR: revalidate every 60s
  cache: 'force-cache',
});
```

### File Naming (App Router)

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (booking)/
│   ├── search/page.tsx
│   ├── [flightId]/page.tsx
│   └── checkout/page.tsx
├── (user)/
│   ├── my-trips/page.tsx
│   └── profile/page.tsx
├── api/
│   └── flights/
│       └── route.ts
└── layout.tsx
```

## State Management (Zustand)

```typescript
// store/useBookingStore.ts
interface BookingState {
  flightId: string | null;
  passengers: Passenger[];
  totalPrice: number;
  setFlight: (id: string, price: number) => void;
  addPassenger: (p: Passenger) => void;
  clearBooking: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  flightId: null,
  passengers: [],
  totalPrice: 0,
  setFlight: (id, price) => set({ flightId: id, totalPrice: price, passengers: [] }),
  addPassenger: (p) => set((s) => ({ passengers: [...s.passengers, p] })),
  clearBooking: () => set({ flightId: null, passengers: [], totalPrice: 0 }),
}));
```

## Forms (React Hook Form + Zod)

```typescript
const schema = z.object({
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().regex(/^(0[1-9])+[0-9]{8}$/, 'Số điện thoại không hợp lệ'),
});

export function PassengerForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input {...register('fullName')} />
      {errors.fullName && <p>{errors.fullName.message}</p>}
      {/* ... */}
    </form>
  );
}
```

## WebSocket (Socket.IO)

```typescript
// hooks/useFlightSocket.ts
export function useFlightSocket(flightId: string) {
  const [seatUpdates, setSeatUpdates] = useState<SeatUpdate[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_WS_URL as string);

    socket.on(`flight:${flightId}:seat-update`, (data: SeatUpdate) => {
      setSeatUpdates((prev) => [...prev, data]);
    });

    socket.on(`booking:${flightId}:payment-status`, (status: string) => {
      setPaymentStatus(status);
    });

    return () => { socket.disconnect(); };
  }, [flightId]);

  return { seatUpdates, paymentStatus };
}
```

## Tailwind CSS

- Use `@apply` sparingly; prefer direct utility classes for maintainability
- Co-locate component-specific styles in `components/` directories
- Extract repeated patterns into `tailwind.config.ts` theme extensions
- Use `tailwind-merge` and `clsx` for conditional classes

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage
<div className={cn('base-class', isActive && 'active-class', className)}>
```

## Performance

- Use `next/image` for all images (automatic optimization, lazy loading)
- Use `next/dynamic` with `ssr: false` for heavy client-only components (maps, charts)
- Implement skeleton loaders for async content
- Use `Suspense` boundaries to prevent entire page from showing loading state
- Monitor Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
