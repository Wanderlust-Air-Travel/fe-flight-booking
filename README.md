# Flight Booking Frontend

Frontend cho hệ thống đặt vé máy bay nội địa Việt Nam, xây dựng bằng Next.js 16 và React 19.

## Tổng quan

Frontend này chịu trách nhiệm cho:
- tìm kiếm chuyến bay
- chọn cabin / seat map
- reservation và booking flow
- payment flow
- check-in và tra cứu booking
- admin UI (một phần)
- realtime updates từ backend

## Tech Stack

- **Framework**: Next.js 16.0.1 (App Router)
- **Language**: TypeScript
- **UI**: Tailwind CSS v4, Radix UI, shadcn/ui
- **State**: Zustand
- **HTTP**: Axios
- **Forms**: React Hook Form, Zod, Yup, Formik
- **Notifications**: SweetAlert2
- **Realtime**: Socket.IO Client
- **Charts**: Recharts

## Project Structure

```text
fe-flight-booking/
├── app/                    # App Router pages + API routes
│   ├── (page)/             # Public pages
│   └── api/                # BFF / proxy routes
├── components/             # Shared UI components
├── lib/                    # Utilities, API config, toast helpers
├── store/                  # Zustand stores
├── public/                 # Static assets
├── docs/                   # Frontend docs
└── package.json
```

## Requirements

- Node.js 18+
- npm 9+
- backend chạy tại `http://localhost:3000`

## Quick Start

```bash
cd fe-flight-booking
npm install
npm run dev
```

Frontend chạy tại: [http://localhost:3001](http://localhost:3001)

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run update:browser-data
```

## Environment Variables

Các biến quan trọng:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

Xem file mẫu trong `.env.example`.

## Backend Integration

Frontend giao tiếp với backend theo 2 hướng:
- **HTTP** qua `NEXT_PUBLIC_API_URL`
- **WebSocket** qua `NEXT_PUBLIC_WS_URL`

Một số API được đi qua `app/api/*` theo kiểu BFF / proxy route.

## Main User Flows

- search flights
- choose fare / cabin
- seat selection
- passenger info
- booking + payment
- check-in / booking lookup
- my tickets / my journey

## Realtime Features

- seat availability updates
- reservation countdown
- payment status updates

## Documentation

- [`docs/README.md`](./docs/README.md) — chỉ mục tài liệu frontend
- backend Swagger: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## Notes

- Toast system hiện dùng **SweetAlert2**, không dùng React-Toastify.
- Frontend dev server mặc định chạy ở **port 3001**.
