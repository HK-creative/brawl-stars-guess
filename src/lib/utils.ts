
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns an appropriate font size class based on text length
 * @param text The text to evaluate
 * @param baseSize Base font size class (default text-base)
 * @returns A Tailwind font size class
 */
export function adaptiveTextSize(text: string, baseSize: string = "text-base"): string {
  if (!text) return baseSize;
  
  if (text.length >= 10) return "text-xs";
  if (text.length >= 8) return "text-sm";
  if (text.length >= 6) return "text-base";
  return "text-lg";
}
