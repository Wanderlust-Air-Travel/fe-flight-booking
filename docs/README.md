# Frontend Docs Index

Chỉ mục tài liệu cho `fe-flight-booking`.

## Bắt đầu nhanh

- [`../README.md`](../README.md) — hướng dẫn chạy frontend
- Frontend local: [http://localhost:3001](http://localhost:3001)
- Backend Swagger: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## Tài liệu chính

- [`DEPLOYMENT.md`](./DEPLOYMENT.md) — deployment notes và production setup
- [`../lib/TOAST_USAGE.md`](../lib/TOAST_USAGE.md) — toast / notification usage
- [`../lib/LAZY_LOADING_GUIDE.md`](../lib/LAZY_LOADING_GUIDE.md) — lazy loading patterns

## Environment

Biến môi trường quan trọng:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

## Cấu trúc chính

```text
fe-flight-booking/
├── app/                    # Pages + API routes
├── components/             # Shared UI components
├── lib/                    # Helpers, API config, toast, utils
├── store/                  # Zustand stores
├── public/                 # Static assets
└── docs/                   # This folder
```

## Các chủ đề nội bộ quan trọng

- error handling và toast UX
- hydration / client state issues
- booking flow pages
- seat-map flow
- airport data fetching qua backend
- realtime integration với backend

## Scripts hữu ích

```bash
npm run dev
npm run build
npm run lint
npm run update:browser-data
```

## Ghi chú

- Toast layer dùng **SweetAlert2**.
- Frontend dùng **Next.js App Router**.
- Một số route backend được proxy qua `app/api/*` để giữ client code gọn hơn.
