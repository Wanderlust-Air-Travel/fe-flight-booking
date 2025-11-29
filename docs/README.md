# Frontend Documentation

Tài liệu ngắn gọn cho Frontend developers.

## Thay đổi quan trọng

### Guest Booking Support (2025-11-28)

**Tính năng mới**: Hệ thống hiện hỗ trợ guest bookings (đặt vé không cần đăng nhập)

**Thay đổi:**
- `POST /api/bookings` - Không còn yêu cầu bắt buộc đăng nhập
- `POST /api/reservations` - Không còn yêu cầu bắt buộc đăng nhập
- Contact information là **BẮT BUỘC** cho guest bookings
- Contact information là **OPTIONAL** cho authenticated bookings (sẽ dùng user info nếu không có)
- Guest bookings không thể dùng `passengerId` (phải cung cấp đầy đủ passenger info)

**Files đã cập nhật:**
- `app/api/bookings/route.ts` - Authorization header là optional
- `app/api/reservations/route.ts` - Authorization header là optional
- `app/(page)/booking/info/page.tsx` - Bỏ yêu cầu login, hỗ trợ guest booking

**Cách dùng:**
```tsx
// Guest booking (không cần token)
const response = await axiosPublic.post(
  `/api/bookings?reservationId=${reservationId}`,
  {
    passengers: [{ fullname, dob, gender, documentNumber, passengerType }],
    contactFullname: "...",  // REQUIRED for guest
    contactEmail: "...",      // REQUIRED for guest
    contactPhone: "...",      // REQUIRED for guest
  }
);

// Authenticated booking (có token - contact info optional)
const response = await axiosInstance.post(
  `/api/bookings?reservationId=${reservationId}`,
  {
    passengers: [{ passengerId, passengerType }],  // Can reuse passenger
    // contact info optional - will use user info
  }
);
```

---

## Thay đổi quan trọng (2025-11-25 đến 2025-11-26)

### 1. Booking Flow - URL Pattern (QUAN TRỌNG)

**Theo docs BE, URL pattern phải dùng query params, không dùng path params**

**Trước (SAI)**:
```
/choosecabin/[flightInstanceId]/[cabinyype]
```

**Sau (ĐÚNG)**:
```
/booking/seat-map?flightInstanceId=xxx
```

**Lý do**: 
- Backend tự động lấy `cabinType` từ Redis booking state
- Frontend không cần truyền `cabinType` trong URL
- Stateless frontend - có thể lấy `flightInstanceId` từ URL params

**Files đã cập nhật**:
- `app/components/TripList/TripList.tsx` - Navigate đến `/booking/seat-map?flightInstanceId=xxx`
- `app/(page)/booking/seat-map/page.tsx` - Lấy `flightInstanceId` từ query params

**Cách dùng**:
```tsx
// Sau khi save cabin selection
router.push(`/booking/seat-map?flightInstanceId=${flightInstanceId}`);

// Trong seat map page
const flightInstanceId = searchParams.get('flightInstanceId');
```

### 2. Axios Instance với Auto Token Refresh (BEST PRACTICE)

**Vấn đề**: Token hết hạn (15 phút) → 401 Unauthorized → User phải login lại

**Giải pháp**: Centralized Axios instance với interceptor tự động refresh token

**File**: `lib/axios-instance.ts`

**Tính năng**:
- Tự động thêm `Authorization` header vào mọi request
- Tự động detect 401 và refresh token
- Queue các requests đang chờ khi refresh token
- Tự động retry sau khi refresh thành công
- Tự động logout nếu refresh thất bại

**Cách dùng**:
```tsx
import axiosInstance from '@/lib/axios-instance';

// Thay vì:
axios.post('/api/bookings', data, {
  headers: { Authorization: `Bearer ${token}` }
});

// Dùng:
axiosInstance.post('/api/bookings', data);
// Token tự động được thêm, refresh tự động khi cần
```

**Public APIs** (không cần token):
```tsx
import { axiosPublic } from '@/lib/axios-instance';

axiosPublic.get('/api/search/fare-options?flightInstanceId=xxx');
```

### 3. Booking Flow - Complete Implementation (kèm Payment)

**Flow hoàn chỉnh**:
1. Search flights → Chọn flight
2. Chọn cabin → Save cabin selection → Navigate đến seat map
3. Chọn seat → Save seat selection → Navigate đến booking info
4. Nhập thông tin → Tạo reservation → Tạo booking
5. Sau khi tạo booking thành công → Redirect sang trang payment

**Files mới**:
- `app/(page)/booking/seat-map/page.tsx` - Trang chọn ghế
- `app/(page)/booking/info/page.tsx` - Trang nhập thông tin booking
- `app/(page)/booking/payment/page.tsx` - Trang thanh toán sau khi tạo booking
- `app/api/booking-state/seat/route.ts` - Proxy cho save seat selection
- `app/api/reservations/route.ts` - Proxy cho create/list reservations
- `app/api/bookings/route.ts` - Proxy cho create booking
- `app/api/auth/refresh/route.ts` - Proxy cho refresh token
- `app/api/search/fare-options/route.ts` - Proxy cho fare options
 - `app/api/payments/bookings/[bookingId]/process/route.ts` - Proxy process payment cho booking

**Navigation Flow**:
```tsx
// 1. Sau khi chọn cabin
router.push(`/booking/seat-map?flightInstanceId=${flightInstanceId}`);

// 2. Sau khi chọn seat
router.push(`/booking/info?flightInstanceId=${flightInstanceId}`);

// 3. Sau khi tạo booking thành công → chuyển sang trang Payment
router.push(`/booking/payment?bookingId=${bookingId}`);
```

### 4. Fix Double API Calls

**Vấn đề**: React Strict Mode gây double rendering → API bị gọi 2 lần

**Giải pháp**: Dùng `useRef` để track fetch status

**Files đã fix**:
- `app/(page)/booking/seat-map/page.tsx` - `hasFetchedRef` cho seat map API
- `app/(page)/booking/info/page.tsx` - `hasCreatedReservationRef` cho reservation API
- `app/hooks/useDeals.ts` - `hasFetchedRef` cho deals API

**Pattern**:
```tsx
const hasFetchedRef = useRef<boolean>(false);

useEffect(() => {
  if (hasFetchedRef.current) return;
  hasFetchedRef.current = true;
  
  // API call here
}, []);
```

### 5. Separation of Interfaces

**Quy tắc**: Tất cả interfaces phải tách riêng khỏi logic code

**Location**: `types/*.d.ts`

**Files đã tách**:
- `types/booking-form-type.d.ts` - `PassengerFormData`, `BookingFormData`
- `types/seat-map-component-type.d.ts` - `SeatRowProps`, `CabinSectionProps`, etc.
- `types/seat-utils-type.d.ts` - `SeatRow`, `SeatSection`
- `types/use-deals-type.d.ts` - `UseDealsResult`
- `types/trip-list-component-type.d.ts` - `TripListPropsType`
- `types/item-service-type.d.ts` - `ItemServiceProp`
- `types/select-component-type.d.ts` - `SelectComponentProp`
- `types/auth-form-type.d.ts` - `SignupFormValue`, `SigninFormValue`
- `types/user-login-type.d.ts` - `AuthState`

**Cách dùng**:
```tsx
import { SeatRowProps } from '@/types/seat-map-component-type';

const SeatRow = ({ seats, rowNumber }: SeatRowProps) => {
  // Component logic
};
```

### 6. Seat Map Optimization

**Vấn đề**: Render quá nhiều seats cùng lúc → lag, không hiển thị đẹp

**Giải pháp**: Group seats theo rows và sections, sử dụng memoization

**Files**:
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

### 7. useDeals Hook - Fix Infinite Loop

**Vấn đề**: `useEffect` với `[services]` dependency gây infinite loop

**Giải pháp**: Custom hook với `useRef` để track fetch status

**File**: `app/hooks/useDeals.ts`

**Cách dùng**:
```tsx
const { services, loading, error } = useDeals();
// Chỉ fetch 1 lần khi component mount
```

### 8. Next.js API Route Proxies

**Vấn đề**: Direct API calls gây CORS issues, không có caching

**Giải pháp**: Next.js API routes với caching và error handling

**Files**:
- `app/api/services/deals/route.ts` - Proxy với cache 5 phút
- `app/api/search/seats/route.ts` - Proxy cho seat map
- `app/api/search/fare-options/route.ts` - Proxy cho fare options
- `app/api/booking-state/cabin/route.ts` - Proxy cho cabin selection
- `app/api/booking-state/seat/route.ts` - Proxy cho seat selection
- `app/api/reservations/route.ts` - Proxy cho reservations
- `app/api/bookings/route.ts` - Proxy cho bookings
- `app/api/auth/refresh/route.ts` - Proxy cho token refresh

**Cách dùng**:
```tsx
// Thay vì gọi trực tiếp backend
axios.get('http://localhost:3000/api/v1/services/deals')

// Dùng Next.js API route
axios.get('/api/services/deals')
```

**Lưu ý**: 
- API routes chạy trên server → dùng `process.env.API_URL` (không phải `NEXT_PUBLIC_API_URL`)
- Client components → dùng `process.env.NEXT_PUBLIC_API_URL`

### 9. Fix Duplicate React Keys

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

### 10. Remove jQuery Dependency

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
- Prevent double API calls với `useRef`

### API Calls
- **LUÔN** dùng `axiosInstance` cho protected APIs (tự động thêm token, auto refresh)
- Dùng `axiosPublic` cho public APIs
- Luôn dùng Next.js API routes (`/api/*`)
- Dùng custom hooks cho data fetching
- Prevent infinite loops với `useRef`

### Authentication
- Token tự động được thêm vào requests qua `axiosInstance`
- Token tự động refresh khi hết hạn (401)
- Không cần thêm token thủ công trong components
- Nếu refresh thất bại → tự động logout

### Code Organization
- **BẮT BUỘC**: Tất cả interfaces tách riêng vào `types/*.d.ts`
- Utility functions tách riêng (`app/utils/`)
- Custom hooks tách riêng (`app/hooks/`)
- Components compose từ smaller components
- API routes tách riêng (`app/api/`)

### URL Patterns
- **QUAN TRỌNG**: Dùng query params cho booking flow
- Pattern: `/booking/seat-map?flightInstanceId=xxx`
- Không dùng path params cho `cabinType` (backend tự lấy từ Redis)

## Environment Variables

**Client-side** (browser):
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: `http://localhost:3000`)

**Server-side** (API routes):
- `API_URL` - Backend API URL (hoặc fallback `NEXT_PUBLIC_API_URL`)
- Default: `http://localhost:3000`

## Quick Reference

### Fetch Deals
```tsx
const { services, loading, error } = useDeals();
```

### Fetch Fare Options
```tsx
import { axiosPublic } from '@/lib/axios-instance';

const response = await axiosPublic.get(
  `/api/search/fare-options?flightInstanceId=${flightInstanceId}&cabinType=economy`
);
```

### Save Cabin Selection
```tsx
import axiosInstance from '@/lib/axios-instance';

await axiosInstance.post('/api/booking-state/cabin', {
  flightInstanceId,
  cabinType,
  fareClassCode
});
```

### Fetch Seat Map
```tsx
import axiosInstance from '@/lib/axios-instance';

const response = await axiosInstance.get(
  `/api/search/seats?flightInstanceId=${flightInstanceId}`
);
// Backend tự động lấy cabinType từ Redis, không cần truyền
```

### Save Seat Selection
```tsx
import axiosInstance from '@/lib/axios-instance';

await axiosInstance.post('/api/booking-state/seat', {
  flightInstanceId,
  flightSeatId,
  seatNumber
});
```

### Create Reservation
```tsx
import axiosInstance from '@/lib/axios-instance';

const response = await axiosInstance.post('/api/reservations', {
  segments: [{ flightInstanceId, segmentType: 'outbound' }],
  numberOfPassengers: 1
});
```

### Create Booking
```tsx
import axiosInstance from '@/lib/axios-instance';

const response = await axiosInstance.post(
  `/api/bookings?reservationId=${reservationId}`,
  {
    passengers: [
      {
        fullname: '...',
        email: '...',
        phone: '...',
        dob: '...',
        address: '...'
      }
    ]
  }
);
```

### Generate Unique Keys
```tsx
import { generateServiceKey } from '@/app/utils/key-utils';
key={generateServiceKey(service.link, index)}
```

## Files Changed

**New Files**:
- `lib/axios-instance.ts` - Axios instance với auto token refresh
- `app/utils/seat-utils.ts` - Utility functions để group seats
- `app/utils/key-utils.ts` - Utility function để generate unique keys
- `app/hooks/useDeals.ts` - Custom hook cho deals
- `app/components/SeatMap/*` - 4 components (SeatRow, SeatSection, CabinSection, SectionNavigation)
- `app/(page)/booking/seat-map/page.tsx` - Trang chọn ghế
- `app/(page)/booking/info/page.tsx` - Trang nhập thông tin booking
- `app/api/booking-state/seat/route.ts` - Proxy cho seat selection
- `app/api/reservations/route.ts` - Proxy cho reservations
- `app/api/bookings/route.ts` - Proxy cho bookings
- `app/api/auth/refresh/route.ts` - Proxy cho token refresh
- `app/api/search/fare-options/route.ts` - Proxy cho fare options
- `types/*.d.ts` - Tất cả interfaces đã tách riêng

**Updated Files**:
- `app/components/TripList/TripList.tsx` - Removed jQuery, dùng axiosInstance, navigate đúng URL pattern
- `app/components/Services/*` - Use useDeals hook, fix keys
- `app/api/search/seats/route.ts` - Updated
- `app/api/booking-state/cabin/route.ts` - Updated
- `app/zustand/storeUser.tsx` - Added refreshAccessToken function

**Removed Files**:
- `app/(page)/choosecabin/[flightInstanceId]/[cabinyype]/page.tsx` - Đã merge vào `/booking/seat-map`

## Notes

- **QUAN TRỌNG**: URL pattern cho seat selection phải là `/booking/seat-map?flightInstanceId=xxx` (theo docs BE)
- Tất cả API calls nên đi qua Next.js API routes (`/api/*`)
- **BẮT BUỘC**: Dùng `axiosInstance` cho protected APIs (tự động thêm token, auto refresh)
- Seat map đã được optimize để handle số lượng seats lớn
- Không còn jQuery dependency
- React keys đã được fix để tránh warnings
- Tất cả interfaces đã tách riêng vào `types/*.d.ts`
- Double API calls đã được fix với `useRef`
- Booking flow hoàn chỉnh: cabin → seat → reservation → booking

## Troubleshooting

### Token hết hạn (401 Unauthorized)
- **Giải pháp**: `axiosInstance` tự động refresh token
- Nếu vẫn lỗi → Check console logs `[Axios Interceptor]`
- Nếu refresh thất bại → User sẽ tự động logout

### API bị gọi 2 lần
- **Nguyên nhân**: React Strict Mode trong development
- **Giải pháp**: Dùng `useRef` để track fetch status (đã implement)

### URL không đúng
- **Kiểm tra**: URL phải là `/booking/seat-map?flightInstanceId=xxx`
- **Không dùng**: `/choosecabin/[flightInstanceId]/[cabinyype]`

### Interface errors
- **Kiểm tra**: Interfaces phải ở trong `types/*.d.ts`
- **Không được**: Đặt interfaces trong cùng file với logic code
