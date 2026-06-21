export const defaultLocale = "en";

export const locales = {
  en: {
    code: "en",
    label: "English",
    path: "/"
  },
  es: {
    code: "es",
    label: "Español",
    path: "/es/"
  }
};

export type LocaleCode = keyof typeof locales;
