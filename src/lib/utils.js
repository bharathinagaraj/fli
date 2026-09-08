import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export const containerClass = "w-full px-4 sm:px-6 lg:px-8";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatPrice(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return "₹0";
  return "₹" + num.toLocaleString("en-IN", {
    maximumFractionDigits: num % 1 === 0 ? 0 : 2,
  });
}
