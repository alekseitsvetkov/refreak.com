import { getTranslations } from "next-intl/server";
import { format } from "date-fns";
import { enUS, ru } from "date-fns/locale";
import { type DateFormat } from "./date-utils";

const locales = {
  en: enUS,
  ru: ru,
};

/**
 * Форматирует дату в серверном компоненте с использованием next-intl
 * @param input - Дата для форматирования
 * @param locale - Локаль
 * @param formatType - Тип форматирования
 * @returns Отформатированная дата
 */
export async function formatDateServer(
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
 * Форматирует дату публикации для серверных компонентов
 * @param input - Дата для форматирования
 * @param locale - Локаль
 * @returns Отформатированная дата публикации
 */
export async function formatPublishedDate(
  input: string | number | Date,
  locale: string = "en"
): Promise<string> {
  return formatDateServer(input, locale, "long");
}

/**
 * Форматирует короткую дату для серверных компонентов
 * @param input - Дата для форматирования
 * @param locale - Локаль
 * @returns Отформатированная короткая дата
 */
export async function formatShortDate(
  input: string | number | Date,
  locale: string = "en"
): Promise<string> {
  return formatDateServer(input, locale, "short");
}
