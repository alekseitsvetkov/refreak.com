import { ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

import { env } from "@/env.mjs"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Импортируем новую функцию форматирования дат
import { formatDateClient } from "./date-utils";

// Оставляем старую функцию для обратной совместимости
export function formatDate(input: string | number): string {
  return formatDateClient(input, "en", "long");
}

export function absoluteUrl(path: string) {
  return `${env.NEXT_PUBLIC_APP_URL}${path}`
}
