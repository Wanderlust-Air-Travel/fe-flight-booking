/**
 * =====================================================================
 *  Flight Booking — Design Tokens (Single Source of Truth)
 * =====================================================================
 *
 *  MỌI size chữ / spacing / radius trong dự án PHẢI đi qua file
 *  này. Không hard-code `1.4rem`, `h-9`, `px-4`... ở component.
 *
 *  Scale base 10px → 1rem = 10px
 *    vd: space[4] = 1.6rem = 16px  (= 4 × 4px grid)
 *
 *  Cách dùng:
 *    1) Tailwind class (ưu tiên): `text-md`, `h-control-md`, `p-4`
 *       -> Tailwind 4 @theme inline map vào token bên dưới.
 *    2) CSS: `var(--text-md)`, `var(--space-4)`, ...
 *    3) TS inline-style: `style={{ fontSize: tokens.fontSize.md }}`
 *       hoặc `cnSize('text', 'md')`
 * =====================================================================
 */

/* ================================================================
 *  FONT SIZE SCALE  —  Tailwind 4 default naming
 *  (maps directly to Tailwind text-* utilities via @theme)
 * ================================================================ */
export const tokens = {
  fontSize: {
    /**
     * 12px — micro (badge, timestamp, helper text)
     * Tăng từ 11px → 12px vì 11px quá nhỏ không đọc được trên desktop.
     * Trên mobile nếu cần nhỏ hơn, dùng responsive: text-xs sm:text-sm
     */
    xs: "1.2rem",      // 12px
    /**
     * 13px — caption / small helper
     * Tăng từ 12px → 13px làm base minimum cho desktop.
     */
    sm: "1.3rem",      // 13px
    /** 14px — body small (form helper, table) */
    base: "1.4rem",    // 14px
    /** 16px — body default (paragraph, list) */
    md: "1.6rem",      // 16px
    /** 18px — body large (button, input) */
    lg: "1.8rem",      // 18px
    /** 20px — h6 */
    xl: "2rem",        // 20px
    /** 24px — h5 */
    "2xl": "2.4rem",   // 24px
    /** 28px — h4 */
    "3xl": "2.8rem",   // 28px
    /** 32px — h3 */
    "4xl": "3.2rem",   // 32px
    /** 40px — h2 */
    "5xl": "4rem",     // 40px
    /** 48px — h1 */
    "6xl": "4.8rem",   // 48px
    /** 56px — display */
    "7xl": "5.6rem",   // 56px
    /** 64px — hero */
    "8xl": "6.4rem",   // 64px
  } as const,

  /* ----------------------------------------------------------------
   *  LINE HEIGHT
   * ---------------------------------------------------------------- */
  lineHeight: {
    tight: "1.2",
    snug: "1.3",
    normal: "1.5",
    relaxed: "1.625",
    loose: "1.8",
  } as const,

  /* ----------------------------------------------------------------
   *  FONT WEIGHT
   * ---------------------------------------------------------------- */
  fontWeight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  } as const,

  /* ----------------------------------------------------------------
   *  SPACING SCALE  —  4px grid, base 10px
   *  (maps to Tailwind p-*, m-*, gap-*, etc. via @theme)
   * ---------------------------------------------------------------- */
  space: {
    "0": "0",
    px: "1px",                      // 1px
    "0.5": "0.2rem",                // 2px
    "1": "0.4rem",                  // 4px
    "1.5": "0.6rem",                // 6px
    "2": "0.8rem",                  // 8px
    "2.5": "1rem",                  // 10px
    "3": "1.2rem",                  // 12px
    "4": "1.6rem",                  // 16px
    "5": "2rem",                    // 20px
    "6": "2.4rem",                  // 24px
    "7": "2.8rem",                  // 28px
    "8": "3.2rem",                  // 32px
    "9": "3.6rem",                  // 36px
    "10": "4rem",                   // 40px
    "11": "4.4rem",                 // 44px
    "12": "4.8rem",                 // 48px
    "14": "5.6rem",                 // 56px
    "16": "6.4rem",                 // 64px
    "20": "8rem",                   // 80px
    "24": "9.6rem",                 // 96px
    "28": "11.2rem",                // 112px
    "32": "12.8rem",                // 128px
    "40": "16rem",                  // 160px
    "48": "19.2rem",                // 192px
  } as const,

  /* ----------------------------------------------------------------
   *  CONTROL SIZES  —  button / input / select height
   *  Always multiples of 4 for perfect-pixel alignment
   * ---------------------------------------------------------------- */
  control: {
    /** 28px — xs control (icon-only small) */
    xs: "2.8rem",   // 28px
    /** 32px — small control (sm button, icon-sm) */
    sm: "3.2rem",   // 32px
    /** 40px — default control (button, input, select) */
    md: "4rem",     // 40px
    /** 48px — large control (lg button, icon-lg) */
    lg: "4.8rem",   // 48px
    /** 56px — extra-large control */
    xl: "5.6rem",   // 56px
  } as const,

  /* ----------------------------------------------------------------
   *  ICON SIZES
   * ---------------------------------------------------------------- */
  icon: {
    xs: "1.2rem",   // 12px
    sm: "1.6rem",   // 16px
    md: "2rem",     // 20px
    lg: "2.4rem",   // 24px
    xl: "3.2rem",   // 32px
  } as const,

  /* ----------------------------------------------------------------
   *  RADIUS  —  perfect-pixel corners
   * ---------------------------------------------------------------- */
  radius: {
    none: "0",
    xs: "0.2rem",   // 2px
    sm: "0.4rem",   // 4px
    md: "0.6rem",   // 6px
    lg: "0.8rem",   // 8px
    xl: "1.2rem",   // 12px
    "2xl": "1.6rem", // 16px
    "3xl": "2.4rem", // 24px
    full: "9999px",
  } as const,

  /* ----------------------------------------------------------------
   *  BORDER WIDTH
   * ---------------------------------------------------------------- */
  borderWidth: {
    "0": "0",
    DEFAULT: "1px",
    "2": "2px",
    "4": "4px",
  } as const,

  /* ----------------------------------------------------------------
   *  Z-INDEX SCALE
   * ---------------------------------------------------------------- */
  zIndex: {
    hide: "-1",
    base: "0",
    raised: "10",
    dropdown: "100",
    sticky: "200",
    overlay: "300",
    modal: "400",
    popover: "500",
    toast: "600",
    tooltip: "700",
    max: "9999",
  } as const,

  /* ----------------------------------------------------------------
   *  LAYOUT  —  project-specific sizes
   * ---------------------------------------------------------------- */
  layout: {
    header: {
      sm: "6rem",     // 60px
      md: "7rem",     // 70px
      lg: "8rem",     // 80px
      xl: "9rem",     // 90px
    },
    container: {
      sm: "64rem",    // 640px
      md: "76.8rem",  // 768px
      lg: "102.4rem", // 1024px
      xl: "120rem",   // 1200px
      "2xl": "143.2rem", // 1432px
    },
    sidebar: {
      sm: "24rem",
      md: "28rem",
      lg: "32rem",
    },
  } as const,

  /* ----------------------------------------------------------------
   *  BRAND COLORS
   * ---------------------------------------------------------------- */
  color: {
    primary: "#00558f",
    secondary: "#ffffff",
    accent: "#3775A4",
    success: "#7ED957",
    successDark: "#64AF53",
    line: "#DBDFEA",
    lineSoft: "#D3DAD9",
    gray: "#667085",
    danger: "#D83D32",
  } as const,

  /* ----------------------------------------------------------------
   *  TRANSITION DURATION
   * ---------------------------------------------------------------- */
  duration: {
    fast: "150ms",
    normal: "250ms",
    slow: "400ms",
  } as const,
} as const;

/* ================================================================
 *  TYPE EXPORTS  —  IDE auto-complete + type-safe enforcement
 * ================================================================ */
export type FontSizeToken = keyof typeof tokens.fontSize;
export type SpaceToken = keyof typeof tokens.space;
export type RadiusToken = keyof typeof tokens.radius;
export type ColorToken = keyof typeof tokens.color;
export type ControlSize = keyof typeof tokens.control;
export type IconSize = keyof typeof tokens.icon;
export type HeaderSize = keyof typeof tokens.layout.header;
export type ContainerSize = keyof typeof tokens.layout.container;

/* ================================================================
 *  WHITELIST  —  for ESLint custom rules (future)
 * ================================================================ */
export const FONT_SIZE_WHITELIST = new Set<string>(
  Object.values(tokens.fontSize),
);

export const SPACE_WHITELIST = new Set<string>([
  ...Object.values(tokens.space),
  "0",
  "1px",
]);

export const RADIUS_WHITELIST = new Set<string>(
  Object.values(tokens.radius),
);

/* ================================================================
 *  BACKWARD-COMPAT ALIASES  —  prevent breaking old CSS vars
 *  (these map to new scale so old code keeps working)
 * ================================================================ */
export const alias = {
  /** --text-sm (old) → --text-sm (new, same value) */
  textSm: tokens.fontSize.sm,
  /** --text-mn (old) → --text-base (new) */
  textMn: tokens.fontSize.base,
  /** --text-normal (old) → --text-md (new) */
  textNormal: tokens.fontSize.md,
  /** --text-md (old) → --text-xl (new) — was 20px, now 20px ✓ */
  textMd: tokens.fontSize.xl,
  /** --text-lg (old) → --text-4xl (new) — was 32px, now 32px ✓ */
  textLg: tokens.fontSize["4xl"],
  /** --hd → header height */
  headerHeightSm: tokens.layout.header.sm,
  headerHeightMd: tokens.layout.header.md,
  headerHeightLg: tokens.layout.header.lg,
  headerHeightXl: tokens.layout.header.xl,
} as const;
