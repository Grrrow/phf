import { defaultLocale, type LocaleCode } from './config';

export const ui = {
  es: {
    'contact.title': 'Contacto',
    'contact.subtitle': 'Para consultas generales, dirección de orquesta y prensa.',
    'contact.general': 'Contacto',
  },
  en: {
    'contact.title': 'Contact',
    'contact.subtitle': 'For general inquiries, conducting engagements, and press.',
    'contact.general': 'Contact',
  },
} as const;

export function useTranslations(lang: LocaleCode) {
  return function t(key: keyof typeof ui[typeof defaultLocale]) {
    return ui[lang][key] || ui[defaultLocale][key];
  }
}
