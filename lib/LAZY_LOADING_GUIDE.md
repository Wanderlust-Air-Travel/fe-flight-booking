# Lazy Loading Implementation Guide

## Tổng quan

Dự án sử dụng **native lazy loading** với Next.js 16 và React 19, không cần thư viện bên ngoài. Giải pháp này tương thích hoàn toàn với React 19 và tối ưu cho Next.js App Router.

## Các Components đã tạo

### 1. `LazyLoad` Component
Component chính để lazy load bất kỳ component hoặc element nào.

**Location:** `app/components/LazyLoad/LazyLoad.tsx`

**Features:**
- Sử dụng Intersection Observer API (native browser API)
- Hỗ trợ placeholder
- Configurable offset (khoảng cách từ viewport)
- Once mode (load một lần rồi bỏ qua)
- SSR compatible
- Fallback cho browsers không hỗ trợ IntersectionObserver

**Usage:**
```tsx
import { LazyLoad } from '@/app/components/LazyLoad';

<LazyLoad
    height={300}
    offset={200}
    once={true}
    placeholder={<div>Loading...</div>}
>
    <HeavyComponent />
</LazyLoad>
```

**Props:**
- `children`: ReactNode - Component hoặc element cần lazy load
- `placeholder?`: ReactNode - Placeholder hiển thị khi chưa load
- `height?`: number | string - Chiều cao tối thiểu của container
- `offset?`: number - Khoảng cách từ viewport để bắt đầu load (pixels, default: 100)
- `once?`: boolean - Nếu true, chỉ load một lần (default: true)
- `threshold?`: number - Intersection threshold (0-1, default: 0.01)
- `className?`: string - CSS class cho container
- `style?`: React.CSSProperties - Inline styles

### 2. `LazyImage` Component
Component tối ưu cho lazy loading images với blur placeholder.

**Location:** `app/components/LazyLoad/LazyImage.tsx`

**Usage:**
```tsx
import { LazyImage } from '@/app/components/LazyLoad';

<LazyImage
    src="/path/to/image.jpg"
    alt="Description"
    placeholderImage="/path/to/blur-placeholder.jpg"
    width={500}
    height={300}
    className="rounded-lg"
/>
```

### 3. Next.js `dynamic` Import
Sử dụng Next.js built-in `dynamic` import cho code splitting.

**Usage:**
```tsx
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
    loading: () => <div>Loading...</div>,
    ssr: true, // Enable SSR if needed
});
```

## Đã tích hợp vào

### 1. Home Page (`app/page.tsx`)
- `BannerHome` - Lazy loaded với dynamic import
- `ServiceHome` - Lazy loaded với dynamic import

### 2. Service Home (`app/components/Services/ServiceHome.tsx`)
- `ItemService` - Lazy loaded với dynamic import
- Mỗi service item được wrap trong `LazyLoad` component

### 3. Service Details Page (`app/(page)/service/[id]/page.tsx`)
- `TripList` - Lazy loaded với dynamic import

### 4. ItemService Component (`app/components/ItemService/ItemService.tsx`)
- Image sử dụng Next.js Image với `loading="lazy"`
- Optimized với `fill` và `sizes` prop

## Best Practices

### 1. Khi nào sử dụng `LazyLoad`?
- Components nặng không cần thiết ngay lập tức
- Sections dưới fold (phải scroll mới thấy)
- Images trong lists hoặc galleries
- Modals, dropdowns, tooltips

### 2. Khi nào sử dụng `dynamic` import?
- Components lớn với nhiều dependencies
- Components chỉ dùng ở một số routes cụ thể
- Third-party libraries nặng

### 3. Khi nào KHÔNG lazy load?
- Above-the-fold content (phần hiển thị ngay khi load page)
- Critical components (navigation, search bar)
- Components cần cho SEO
- Components nhỏ, không ảnh hưởng performance

### 4. Tối ưu Images
```tsx
// Good - Sử dụng Next.js Image với lazy loading
<Image
    src="/image.jpg"
    alt="Description"
    fill
    sizes="(max-width: 768px) 100vw, 50vw"
    loading="lazy"
/>

// Bad - Không lazy load
<img src="/image.jpg" alt="Description" />
```

## Performance Benefits

1. **Faster Initial Load**: Chỉ load components cần thiết ngay lập tức
2. **Reduced Bundle Size**: Code splitting giảm kích thước bundle ban đầu
3. **Better User Experience**: Trang load nhanh hơn, tương tác mượt hơn
4. **Bandwidth Savings**: Chỉ tải resources khi cần thiết

## Monitoring

Để monitor performance improvements:

1. **Lighthouse**: Check Performance score
2. **Network Tab**: Xem khi nào components được load
3. **React DevTools Profiler**: Analyze component render times

## Troubleshooting

### Component không lazy load?
- Kiểm tra `offset` prop - có thể quá lớn
- Kiểm tra `height` prop - cần set để IntersectionObserver hoạt động đúng
- Kiểm tra browser console cho errors

### Flash of placeholder?
- Tăng `offset` để load sớm hơn
- Sử dụng skeleton loading thay vì empty placeholder

### SSR issues?
- Đảm bảo `ssr: true` trong dynamic import nếu component cần SEO
- Kiểm tra server-side rendering logs

## Tài liệu tham khảo

- [Next.js Dynamic Imports](https://nextjs.org/docs/advanced-features/dynamic-import)
- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [Next.js Image Optimization](https://nextjs.org/docs/app/api-reference/components/image)

