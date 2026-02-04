import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(amount: number): string {
  return Math.round(amount).toLocaleString('es-PY');
}

export function formatMoneyWithCurrency(amount: number): string {
  return `₲ ${formatMoney(amount)}`;
}
