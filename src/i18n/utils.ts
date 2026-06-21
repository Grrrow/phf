import { locales, defaultLocale, type LocaleCode } from './config';

/**
 * Extrae el código de idioma a partir de la URL.
 * Si la ruta empieza por /es/, devuelve 'es'. En caso contrario, devuelve el locale por defecto 'en'.
 */
export function getLocaleFromUrl(url: URL | string): LocaleCode {
  const pathname = typeof url === 'string' ? new URL(url, 'http://localhost').pathname : url.pathname;

  if (pathname.startsWith('/es/') || pathname === '/es') {
    return 'es';
  }

  return defaultLocale;
}

/**
 * Construye una ruta de URL localizada.
 * Elimina cualquier prefijo de idioma existente y añade el prefijo del nuevo idioma.
 */
export function getLocalizedPath(path: string, locale: LocaleCode): string {
  // Normalizar ruta
  let normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // Eliminar prefijo de idioma existente si lo hay
  if (normalizedPath.startsWith('/es/') || normalizedPath === '/es') {
    normalizedPath = normalizedPath.replace(/^\/es/, '') || '/';
  }

  // Apply new locale path
  if (locale === defaultLocale) {
    return normalizedPath;
  }

  const prefix = locales[locale].path.replace(/\/$/, '');
  return `${prefix}${normalizedPath === '/' ? '' : normalizedPath}`;
}
