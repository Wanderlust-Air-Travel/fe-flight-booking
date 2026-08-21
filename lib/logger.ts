/**
 * Lightweight logger that wraps console methods with NODE_ENV gating.
 * Use `debug`/`warn`/`logError` instead of `console.log` so debug output
 * is stripped from production builds.
 */

const isDev = process.env.NODE_ENV !== "production";

export const debug = (...args: unknown[]) => {
  if (isDev) console.log(...args);
};

export const warn = (...args: unknown[]) => {
  if (isDev) console.warn(...args);
};

export const logError = (...args: unknown[]) => {
  console.error(...args);
};