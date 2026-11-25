import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * A date picker gives "YYYY-MM-DD". `new Date()` reads that as UTC midnight,
 * which shows as the previous day anywhere west of UTC (Anguilla is UTC-4).
 * Pin date-only values to midday UTC so they show the picked day everywhere.
 */
export function parseDateOnly(value: string | Date): Date {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T12:00:00Z`)
  }
  return new Date(value)
}
