import { defaultLocale, type LocaleCode } from './config';

export const ui = {
  es: {
    'contact.title': 'Contacto & Contratación',
    'contact.subtitle': 'Para todas las consultas sobre dirección de orquesta, encargos y prensa.',
    'contact.general': 'Consultas Generales',
  },
  en: {
    'contact.title': 'Contact & Booking',
    'contact.subtitle': 'For all inquiries regarding conducting engagements, commissions, and press.',
    'contact.general': 'General Inquiries',
  },
} as const;

export function useTranslations(lang: LocaleCode) {
  return function t(key: keyof typeof ui[typeof defaultLocale]) {
    return ui[lang][key] || ui[defaultLocale][key];
  }
}
