import { defineRouting } from "next-intl/routing";

export type Locale = "en" | "ru";

export const localeLabel: Record<Locale, string> = {
  en: "English",
  ru: "Русский",
};

const locales: Locale[] = ["en", "ru"];

export const routing = defineRouting({
  locales,
  defaultLocale: "en"
});