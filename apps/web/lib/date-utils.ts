import { getTranslations } from "next-intl/server";
import { format } from "date-fns";
import { enUS, ru } from "date-fns/locale";

export type DateFormat = "long" | "short" | "month" | "day";

const locales = {
  en: enUS,
  ru: ru,
};

/**
 * Форматирует дату с использованием next-intl и date-fns
 * @param input - Дата для форматирования (строка, число или объект Date)
 * @param locale - Локаль (по умолчанию 'en')
 * @param formatType - Тип форматирования (по умолчанию 'long')
 * @returns Отформатированная дата
 */
export async function formatDate(
  input: string | number | Date,
  locale: string = "en",
  formatType: DateFormat = "long"
): Promise<string> {
  const date = new Date(input);
  const t = await getTranslations("date.format");
  
  const formatString = t(formatType);
  const dateLocale = locales[locale as keyof typeof locales] || locales.en;
  
  return format(date, formatString, { locale: dateLocale });
}

/**
 * Форматирует дату для клиентских компонентов
 * @param input - Дата для форматирования
 * @param locale - Локаль
 * @param formatType - Тип форматирования
 * @returns Отформатированная дата
 */
export function formatDateClient(
  input: string | number | Date,
  locale: string = "en",
  formatType: DateFormat = "long"
): string {
  const date = new Date(input);
  const dateLocale = locales[locale as keyof typeof locales] || locales.en;
  
  // Форматы по умолчанию для каждого типа
  const defaultFormats = {
    long: locale === "ru" ? "d MMMM yyyy" : "MMMM d, yyyy",
    short: locale === "ru" ? "d MMM yyyy" : "MMM d, yyyy",
    month: "MMMM yyyy",
    day: "d",
  };
  
  return format(date, defaultFormats[formatType], { locale: dateLocale });
}

/**
 * Получает относительное время (например, "2 дня назад")
 * @param input - Дата для форматирования
 * @param locale - Локаль
 * @returns Относительное время
 */
export function formatRelativeTime(
  input: string | number | Date,
  locale: string = "en"
): string {
  const date = new Date(input);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };
  
  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds);
    if (interval >= 1) {
      if (locale === "ru") {
        return `${interval} ${getRussianUnit(unit, interval)} назад`;
      } else {
        return `${interval} ${unit}${interval === 1 ? "" : "s"} ago`;
      }
    }
  }
  
  return locale === "ru" ? "только что" : "just now";
}

function getRussianUnit(unit: string, count: number): string {
  const units: Record<string, string[]> = {
    year: ["год", "года", "лет"],
    month: ["месяц", "месяца", "месяцев"],
    week: ["неделя", "недели", "недель"],
    day: ["день", "дня", "дней"],
    hour: ["час", "часа", "часов"],
    minute: ["минута", "минуты", "минут"],
  };
  
  const forms = units[unit] || [unit, unit, unit];
  
  if (count % 10 === 1 && count % 100 !== 11) {
    return forms[0];
  } else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
    return forms[1];
  } else {
    return forms[2];
  }
}
