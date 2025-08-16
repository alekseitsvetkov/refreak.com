import { useLocale } from "next-intl";
import { formatDateClient, formatRelativeTime, type DateFormat } from "@/lib/date-utils";

/**
 * Хук для форматирования дат в клиентских компонентах
 * @returns Объект с функциями форматирования дат
 */
export function useDateFormat() {
  const locale = useLocale();

  return {
    /**
     * Форматирует дату
     * @param input - Дата для форматирования
     * @param formatType - Тип форматирования
     * @returns Отформатированная дата
     */
    format: (input: string | number | Date, formatType: DateFormat = "long") => {
      return formatDateClient(input, locale, formatType);
    },

    /**
     * Форматирует дату в длинном формате
     * @param input - Дата для форматирования
     * @returns Отформатированная дата
     */
    formatLong: (input: string | number | Date) => {
      return formatDateClient(input, locale, "long");
    },

    /**
     * Форматирует дату в коротком формате
     * @param input - Дата для форматирования
     * @returns Отформатированная дата
     */
    formatShort: (input: string | number | Date) => {
      return formatDateClient(input, locale, "short");
    },

    /**
     * Форматирует только месяц и год
     * @param input - Дата для форматирования
     * @returns Отформатированная дата
     */
    formatMonth: (input: string | number | Date) => {
      return formatDateClient(input, locale, "month");
    },

    /**
     * Форматирует только день
     * @param input - Дата для форматирования
     * @returns Отформатированная дата
     */
    formatDay: (input: string | number | Date) => {
      return formatDateClient(input, locale, "day");
    },

    /**
     * Форматирует относительное время
     * @param input - Дата для форматирования
     * @returns Относительное время
     */
    formatRelative: (input: string | number | Date) => {
      return formatRelativeTime(input, locale);
    },

    /**
     * Текущая локаль
     */
    locale,
  };
}
