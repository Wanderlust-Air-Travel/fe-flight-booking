# Frontend Documentation

Tài liệu ngắn gọn cho Frontend developers.

## Thay đổi quan trọng (2025-11-25)

### 1. Seat Map Optimization

**Vấn đề**: Render quá nhiều seats cùng lúc → lag, không hiển thị đẹp

**Giải pháp**: Group seats theo rows và sections, sử dụng memoization

**Files mới**:
- `app/utils/seat-utils.ts` - Utility functions để group seats
- `app/components/SeatMap/SeatRow.tsx` - Component render 1 row
- `app/components/SeatMap/SeatSection.tsx` - Component render 1 section
- `app/components/SeatMap/CabinSection.tsx` - Component render cả cabin
- `app/components/SeatMap/SectionNavigation.tsx` - Navigation buttons

**Cách dùng**:
```tsx
<CabinSection
  seatGroup={seatEconomy}
  cabinType="economy"
  selectedSeats={chooseEconomy}
  onSeatToggle={handleEconomySeatToggle}
  isSelectable={data.type === "economy"}
/>
```

### 2. useDeals Hook - Fix Infinite Loop

**Vấn đề**: `useEffect` với `[services]` dependency gây infinite loop

**Giải pháp**: Custom hook với `useRef` để track fetch status

**File**: `app/hooks/useDeals.ts`

**Cách dùng**:
```tsx
const { services, loading } = useDeals();
// Chỉ fetch 1 lần khi component mount
```

### 3. Next.js API Route Proxies

**Vấn đề**: Direct API calls gây CORS issues, không có caching

**Giải pháp**: Next.js API routes với caching

**Files**:
- `app/api/services/deals/route.ts` - Proxy với cache 5 phút
- `app/api/search/seats/route.ts` - Proxy cho seat map
- `app/api/booking-state/cabin/route.ts` - Proxy cho cabin selection

**Cách dùng**:
```tsx
// Thay vì gọi trực tiếp backend
axios.get('http://localhost:3000/api/v1/services/deals')

// Dùng Next.js API route
axios.get('/api/services/deals')
```

### 4. Fix Duplicate React Keys

**Vấn đề**: `service.link` không unique → React warning

**Giải pháp**: Utility function để generate unique keys

**File**: `app/utils/key-utils.ts`

**Cách dùng**:
```tsx
import { generateServiceKey } from '@/app/utils/key-utils';

services.map((service, index) => (
  <Item key={generateServiceKey(service.link, index)} {...service} />
))
```

### 5. Remove jQuery Dependency

**Vấn đề**: jQuery không resolve trong Next.js client components

**Giải pháp**: Replace với CSS transitions và React state

**File**: `app/components/TripList/TripList.tsx`

**Thay đổi**:
- Removed: `import $ from "jquery"`
- Replaced: `slideDown/slideUp` → CSS transitions (`max-height`, `opacity`)
- Used: React state (`openPanelIndex`) để control panel visibility

## Best Practices

### Performance
- Dùng `React.memo()` cho components render lists
- Dùng `useMemo()` cho expensive computations
- Dùng `useCallback()` cho event handlers
- Group data trước khi render

### API Calls
- Luôn dùng Next.js API routes (`/api/*`)
- Dùng custom hooks cho data fetching
- Prevent infinite loops với `useRef`

### Code Organization
- Utility functions tách riêng (`app/utils/`)
- Custom hooks tách riêng (`app/hooks/`)
- Components compose từ smaller components

## Environment Variables

**Client-side** (browser):
- `NEXT_PUBLIC_API_URL` - Backend API URL

**Server-side** (API routes):
- `API_URL` - Backend API URL (hoặc fallback `NEXT_PUBLIC_API_URL`)

## Quick Reference

### Fetch Deals
```tsx
const { services, loading } = useDeals();
```

### Fetch Seat Map
```tsx
const response = await axios.get(
  `/api/search/seats?flightInstanceId=${flightInstanceId}`,
  { headers: { 'Authorization': `Bearer ${token}` } }
);
```

### Save Cabin Selection
```tsx
await axios.post(
  '/api/booking-state/cabin',
  { flightInstanceId, cabinType, fareClassCode },
  { headers: { 'Authorization': `Bearer ${token}` } }
);
```

### Generate Unique Keys
```tsx
import { generateServiceKey } from '@/app/utils/key-utils';
key={generateServiceKey(service.link, index)}
```

## Files Changed

**New Files**:
- `app/utils/seat-utils.ts`
- `app/utils/key-utils.ts`
- `app/hooks/useDeals.ts`
- `app/components/SeatMap/*` (4 components)
- `app/api/services/deals/route.ts`

**Updated Files**:
- `app/components/TripList/TripList.tsx` (removed jQuery)
- `app/components/Services/*` (use useDeals hook, fix keys)
- `app/api/search/seats/route.ts` (updated)
- `app/api/booking-state/cabin/route.ts` (updated)

## Notes

- Tất cả API calls nên đi qua Next.js API routes (`/api/*`)
- Seat map đã được optimize để handle số lượng seats lớn
- Không còn jQuery dependency
- React keys đã được fix để tránh warnings

