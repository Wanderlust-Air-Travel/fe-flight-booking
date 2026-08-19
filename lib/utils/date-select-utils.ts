/**
 * Date select utilities for Day / Month / Year dropdowns
 * Used for Date of Birth input to avoid calendar UI issues
 */

/**
 * Generate day options (01-31)
 */
export const getDays = () => {
  return Array.from({ length: 31 }, (_, i) => {
    const value = (i + 1).toString().padStart(2, "0");
    return { value, label: value };
  });
};

/**
 * Generate month options (01-12)
 */
export const getMonths = () => {
  return Array.from({ length: 12 }, (_, i) => {
    const value = (i + 1).toString().padStart(2, "0");
    return { value, label: value };
  });
};

/**
 * Generate year options from 1900 to current year (descending)
 */
export const getYears = () => {
  const currentYear = new Date().getFullYear();
  const startYear = 1900;
  const years: Array<{ value: string; label: string }> = [];

  for (let year = currentYear; year >= startYear; year--) {
    const value = year.toString();
    years.push({ value, label: value });
  }

  return years;
};
