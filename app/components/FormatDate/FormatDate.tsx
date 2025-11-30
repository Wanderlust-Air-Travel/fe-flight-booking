/**
 * Convert date from DD/MM/YYYY format to YYYY-MM-DD format (ISO 8601)
 * Ensures leading zeros for day and month
 * @param d Date string in DD/MM/YYYY format
 * @returns Date string in YYYY-MM-DD format with leading zeros
 */
export const convertToYMD = (d: string): string => {
  if (!d) return "";
  
  const parts = d.split("/");
  if (parts.length !== 3) {
    // If already in YYYY-MM-DD format, return as is (after validation)
    if (d.includes("-") && d.split("-").length === 3) {
      const [year, month, day] = d.split("-");
      // Normalize to ensure leading zeros
      const normalizedYear = year.padStart(4, "0");
      const normalizedMonth = month.padStart(2, "0");
      const normalizedDay = day.padStart(2, "0");
      return `${normalizedYear}-${normalizedMonth}-${normalizedDay}`;
    }
    return d; // Return as is if format is unrecognized
  }
  
  const [day, month, year] = parts;
  
  // Normalize to ensure leading zeros
  const normalizedYear = year.padStart(4, "0");
  const normalizedMonth = month.padStart(2, "0");
  const normalizedDay = day.padStart(2, "0");
  
  return `${normalizedYear}-${normalizedMonth}-${normalizedDay}`;
};

export function convertToDMY(date: string | Date) {
  const d = new Date(date);

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}


export function convertToLocalTime(date: string | Date) {
  const d = new Date(date);            // đang ở UTC
  const local = new Date(d.getTime() + 7 * 60 * 60 * 1000); // +7 giờ

  const hour = String(local.getHours()).padStart(2, "0");
  const minute = String(local.getMinutes()).padStart(2, "0");

  return `${hour}:${minute}`;
}
