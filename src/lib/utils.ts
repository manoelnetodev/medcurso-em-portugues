import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number as a percentage string, rounded to a specified number of decimal places.
 * @param value The number or string to format.
 * @param decimalPlaces The number of decimal places to round to (default is 2).
 * @returns A formatted percentage string (e.g., "76.50%") or "N/A" if invalid.
 */
export function formatPercentage(value: number | string, decimalPlaces: number = 2): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) {
    return "N/A";
  }
  return `${num.toFixed(decimalPlaces)}%`;
}
