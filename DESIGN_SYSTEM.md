# Flight Booking — Design System

> Single source of truth cho toàn bộ kích thước (font-size, spacing, radius, control heights) trong dự án. Mọi thứ tuân thủ **perfect-pixel 4px grid**.

## 1. Design Tokens

File gốc: `lib/design-tokens.ts`

### 1.1 Font Size Scale

| Token (Tailwind) | CSS Variable | rem | px | Dùng cho |
|---|---|---|---|---|
| `text-xs` | `--text-xs` | 1.1rem | 11px | Badge, timestamp |
| `text-sm` | `--text-sm` | 1.2rem | 12px | Caption, helper text |
| `text-base` | `--text-base` | 1.4rem | 14px | Body small, form |
| `text-md` | `--text-md` | 1.6rem | 16px | Body default |
| `text-lg` | `--text-lg` | 1.8rem | 18px | Body large, button |
| `text-xl` | `--text-xl` | 2rem | 20px | H6 |
| `text-2xl` | `--text-2xl` | 2.4rem | 24px | H5 |
| `text-3xl` | `--text-3xl` | 2.8rem | 28px | H4 |
| `text-4xl` | `--text-4xl` | 3.2rem | 32px | H3 |
| `text-5xl` | `--text-5xl` | 4rem | 40px | H2 |
| `text-6xl` | `--text-6xl` | 4.8rem | 48px | H1 |
| `text-7xl` | `--text-7xl` | 5.6rem | 56px | Display |
| `text-8xl` | `--text-8xl` | 6.4rem | 64px | Hero |

**Backward-compat aliases** (giữ lại để không break code cũ):
- `--text-mn` → `--text-base` (1.4rem ✓)
- `--text-normal` → `--text-md` (1.6rem ✓)
- Old `--text-md` (2rem) = new `--text-xl` ✓
- Old `--text-lg` (3.2rem) = new `--text-4xl` ✓

### 1.2 Control Heights (Button / Input / Select)

| Token (Tailwind) | CSS Variable | rem | px | Dùng cho |
|---|---|---|---|---|
| `h-control-xs` | `--control-xs` | 2.8rem | 28px | Icon-only tiny |
| `h-control-sm` | `--control-sm` | 3.2rem | 32px | Small button |
| `h-control-md` | `--control-md` | 4rem | 40px | Default button/input |
| `h-control-lg` | `--control-lg` | 4.8rem | 48px | Large button |
| `h-control-xl` | `--control-xl` | 5.6rem | 56px | Extra large |

### 1.3 Spacing Scale (4px Grid)

Base: `html { font-size: 10px }`, nên `1rem = 10px`.

| Token (Tailwind) | CSS Variable | rem | px |
|---|---|---|---|
| `spacing-0` | `--space-0` | 0 | 0 |
| `spacing-px` | `--space-px` | — | 1px |
| `spacing-0-5` | `--space-0-5` | 0.2rem | 2px |
| `spacing-1` | `--space-1` | 0.4rem | 4px |
| `spacing-1-5` | `--space-1-5` | 0.6rem | 6px |
| `spacing-2` | `--space-2` | 0.8rem | 8px |
| `spacing-2-5` | `--space-2-5` | 1rem | 10px |
| `spacing-3` | `--space-3` | 1.2rem | 12px |
| `spacing-4` | `--space-4` | 1.6rem | 16px |
| `spacing-5` | `--space-5` | 2rem | 20px |
| `spacing-6` | `--space-6` | 2.4rem | 24px |
| `spacing-7` | `--space-7` | 2.8rem | 28px |
| `spacing-8` | `--space-8` | 3.2rem | 32px |
| `spacing-9` | `--space-9` | 3.6rem | 36px |
| `spacing-10` | `--space-10` | 4rem | 40px |
| `spacing-12` | `--space-12` | 4.8rem | 48px |
| `spacing-16` | `--space-16` | 6.4rem | 64px |
| `spacing-20` | `--space-20` | 8rem | 80px |

### 1.4 Border Radius

| Token | CSS Variable | rem | px |
|---|---|---|---|
| `radius-none` | `--radius-none` | 0 | 0 |
| `radius-xs` | `--radius-xs` | 0.2rem | 2px |
| `radius-sm` | `--radius-sm` | 0.4rem | 4px |
| `radius-md` | `--radius-md` | 0.6rem | 6px |
| `radius-lg` | `--radius-lg` | 0.8rem | 8px |
| `radius-xl` | `--radius-xl` | 1.2rem | 12px |
| `radius-2xl` | `--radius-2xl` | 1.6rem | 16px |
| `radius-3xl` | `--radius-3xl` | 2.4rem | 24px |
| `radius-full` | `--radius-full` | 9999px | — |

### 1.5 Icon Sizes

| Token | CSS Variable | rem | px |
|---|---|---|---|
| `size-icon-xs` | `--icon-xs` | 1.2rem | 12px |
| `size-icon-sm` | `--icon-sm` | 1.6rem | 16px |
| `size-icon-md` | `--icon-md` | 2rem | 20px |
| `size-icon-lg` | `--icon-lg` | 2.4rem | 24px |
| `size-icon-xl` | `--icon-xl` | 3.2rem | 32px |

### 1.6 Layout

**Header height** (responsive):

| Token | CSS Variable | rem | px |
|---|---|---|---|
| sm | `--header-height` | 7rem | 70px |
| md | — | 8rem | 80px |
| lg | — | 9rem | 90px |

## 2. Cách Sử Dụng

### 2.1 Tailwind Class (Ưu tiên)

```tsx
// ✅ Đúng — dùng token mapped Tailwind class
<Text className="text-md">Body text</Text>
<Button size="default" className="h-control-md px-4">Search</Button>
<Input className="h-control-sm text-sm" />

// ❌ Sai — hard-coded giá trị không nằm trong scale
<Text className="text-[15px]">Body text</Text>
<Button className="h-[36px]">Search</Button>
```

### 2.2 CSS Variable

```tsx
// ✅ Đúng — dùng CSS variable từ design tokens
<div style={{ fontSize: "var(--text-md)", padding: "var(--space-4)" }}>
  Content
</div>

// ❌ Sai — giá trị không nằm trong whitelist
<div style={{ fontSize: "1.5rem" }}>Body text</div>
```

### 2.3 TypeScript (Inline Style / Dynamic)

```tsx
import { tokens } from "@/lib/design-tokens"
import { cnSize, fontSize, controlHeight } from "@/lib/cn-size"
import { useHeaderHeight } from "@/lib/use-breakpoint"

// Direct value
const height = tokens.control.md  // "4rem"

// Helper functions
const fs = fontSize("lg")        // "1.8rem"
const ch = controlHeight("md")   // "4rem"

// cnSize for complex cases
const styles = cnSize("text", "xl")        // { fontSize: "2rem" }
const iconStyles = cnSize("icon", "md")   // { width: "2rem", height: "2rem" }
```

### 2.4 Responsive với useBreakpoint

```tsx
import { useBreakpoint, useHeaderHeight } from "@/lib/use-breakpoint"

function MyComponent() {
  const bp = useBreakpoint()
  const headerHeight = useHeaderHeight()

  if (bp.isMobile) {
    return <MobileLayout />
  }
  return <DesktopLayout />
}
```

## 3. Nguyên Tắc Perfect Pixel

### 3.1 Scale Bắt Buộc

Chỉ dùng các giá trị **nằm trong token scale**. Không bao giờ:

- Hard-code `px` hoặc `rem` ngoài scale: `font-size: 15px`, `padding: 7px`
- Dùng giá trị không chia hết cho 4: `height: 37px`
- Dùng số thập phân không cần thiết: `margin: 1.33rem`

### 3.2 4px Grid

Base grid là **4px**. Mọi kích thước phải chia hết cho 4:

| 4px | 8px | 12px | 16px | 20px | 24px | 28px | 32px | 36px | 40px |
|---|---|---|---|---|---|---|---|---|---|
| ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| | | | | | | | | | 44px | 48px | 56px | 64px |
| | | | | | | | | | ✅ | ✅ | ✅ | ✅ |

### 3.3 Control Alignment

Button, Input, Select cùng size phải có **chiều cao bằng nhau**:

```
Button size="default"  → h-control-md = 40px
Input (default)        → h-control-md = 40px
Select (default)       → h-control-md = 40px
```

## 4. Component Checklist

Khi tạo hoặc refactor component, đảm bảo:

- [ ] Font size dùng token (`text-sm`, `text-base`, `var(--text-md)`...)
- [ ] Spacing dùng token (`p-4`, `gap-2`, `var(--space-4)`...)
- [ ] Control height dùng token (`h-control-md`...)
- [ ] Border radius dùng token (`rounded-md`, `var(--radius-md)`...)
- [ ] Icon size dùng token (`size-icon-sm`...)
- [ ] **Không hard-code** giá trị như `font-size: 1.5rem`, `height: 36px`, `padding: 7px`

## 5. Cấu Trúc File

```
fe-flight-booking/
├── app/
│   └── globals.css              # CSS variables + @theme inline
├── lib/
│   ├── design-tokens.ts         # TypeScript tokens (SINGLE SOURCE OF TRUTH)
│   ├── cn-size.ts               # cnSize() helper cho inline-style
│   └── use-breakpoint.ts        # useBreakpoint() hook
└── components/ui/
    ├── button.tsx               # Dùng h-control-*
    ├── input.tsx                # Dùng h-control-md
    ├── select.tsx               # Dùng h-control-md
    └── ...
```

## 6. Migration Guide

### Old → New

| Cũ | Mới |
|---|---|
| `font-size: 1.2rem` | `text-sm` hoặc `var(--text-sm)` |
| `font-size: 1.4rem` | `text-base` hoặc `var(--text-base)` |
| `font-size: 1.6rem` | `text-md` hoặc `var(--text-md)` |
| `font-size: 2rem` | `text-xl` hoặc `var(--text-xl)` |
| `font-size: 3.2rem` | `text-4xl` hoặc `var(--text-4xl)` |
| `h-9` (36px) | `h-control-md` (40px) — hoặc keep `h-9` |
| `h-10` (40px) | `h-control-md` (40px) ✓ |
| `h-8` (32px) | `h-control-sm` (32px) ✓ |
| `px-4` (16px) | `px-4` ✓ |
| `padding: 1.4rem` | `var(--space-4)` (1.6rem) — closest |
| `--hd` (header height) | `--header-height` |
| `--text-sm: 1.2rem !important` | `--text-sm: 1.2rem` (no !important) |
| `--text-mn` | `--text-base` (same value) |
| `--text-normal` | `--text-md` (same value) |
