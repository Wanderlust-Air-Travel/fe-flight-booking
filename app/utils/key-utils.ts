/**
 * Utility functions for generating unique keys in React components
 * Following React best practices for list rendering
 */

/**
 * Generate a unique key for service items
 * Uses combination of link and index to ensure uniqueness even if links are duplicated
 * 
 * @param link - Service link (may not be unique)
 * @param index - Array index (stable within render cycle)
 * @returns Unique key string
 */
export function generateServiceKey(link: string, index: number): string {
  // Sanitize link to remove special characters that might cause issues
  const sanitizedLink = link.replace(/[^a-zA-Z0-9-]/g, '-');
  return `service-${sanitizedLink}-${index}`;
}

/**
 * Generate a unique key for any item with optional unique identifier
 * Falls back to index if no identifier provided
 * 
 * @param identifier - Optional unique identifier (e.g., id, uuid)
 * @param index - Array index as fallback
 * @returns Unique key string
 */
export function generateUniqueKey(identifier?: string | number, index?: number): string {
  if (identifier !== undefined && identifier !== null) {
    return `item-${identifier}`;
  }
  if (index !== undefined) {
    return `item-${index}`;
  }
  // Last resort: use timestamp (should rarely happen)
  return `item-${Date.now()}-${Math.random()}`;
}

