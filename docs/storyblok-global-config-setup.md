# Configuración de Storyblok Global Config

Este documento detalla los pasos para crear y configurar la historia global (`settings/global-config`) en Storyblok, la cual alimenta el Header, Footer, SEO por defecto y la Identidad del Sitio en todo el proyecto Astro.

## 1. Crear la historia en Storyblok

Para que Astro reciba correctamente la configuración global, es **imprescindible** crear una "Story" en Storyblok con una ruta y tipo específicos:

1. Ve a **Content** en tu espacio de Storyblok.
2. Crea una carpeta llamada `settings` (Settings).
3. Dentro de la carpeta `settings`, crea una nueva historia.
4. **Name**: `Global Config` (o el nombre que prefieras).
5. **Slug**: `global-config` (La ruta final será `settings/global-config`, que es el slug que Astro está configurado para buscar).
6. **Content Type**: Selecciona `global_config` en el desplegable.

> **Importante**: `src/pages/[...slug].astro` está configurado para buscar el slug exacto `settings/global-config`. Si decides usar otra ruta, debes actualizar la llamada a la API en ese archivo.

## 2. Configurar la Identidad y el SEO (seo_defaults y site_identity)

La identidad del sitio y el SEO por defecto actúan como fallback en caso de que una página individual no tenga esta información configurada.

1. Añade un bloque `site_identity` en el campo correspondiente.
   - Completa **Site Name** y **Site Tagline**.
   - Sube los **Logos** (principal, oscuro y favicon) y la **Imagen OG por Defecto** (`default_og_image`).
2. Añade un bloque `seo` dentro del campo `seo_defaults`.
   - Rellena **Meta Title** y **Meta Description** por defecto.
   - Estos valores se usarán en toda la web a menos que una página específica los sobrescriba.

## 3. Configurar el Header (header_config)

1. Añade un bloque `header_config` en el campo `header`.
2. Opcionalmente sube un **Logo** específico para la cabecera.
3. En **Navigation**, añade bloques `navigation_menu` o `navigation_item` para construir la estructura de navegación.
4. Configura si deseas el **Selector de Idioma** visible y si el header debe ser *Sticky*.

## 4. Configurar el Footer (footer_config)

1. Añade un bloque `footer_config` en el campo `footer`.
2. Completa el **Footer Text** y sube el **Footer Logo** si aplica.
3. Rellena el **Copyright Text** (ej. "© 2026. Todos los derechos reservados.").
4. En **Navigation**, añade enlaces secundarios si los necesitas.
5. En **Legal Links**, añade bloques `legal_links` o `navigation_item` para enlaces como "Política de Privacidad" y "Aviso Legal".

## 5. Configurar Redes Sociales y Contacto

Estas configuraciones son referenciadas globalmente en el footer o en páginas de contacto.

1. **Social Profiles**: Añade un bloque `social_profiles` y dentro, añade tantos `social_profile_link` como redes sociales tengas.
2. **Contact Info**: Añade un bloque `contact_info` para tener centralizados los correos electrónicos, teléfonos y la dirección de management/booking.

## 6. Traducir el contenido (Multilingüe)

Dado que Astro gestiona la web como bilingüe (Español e Inglés), la traducción de los textos globales se hace directamente sobre esta misma historia:

1. En Storyblok, ve a **Settings > Internationalization** y asegúrate de tener los idiomas configurados correctamente: `es` (por defecto) y `en` (inglés).
2. En la historia `settings/global-config`, en el editor visual, selecciona la vista en el idioma secundario (`en`).
3. Traduce los campos de texto visibles marcados como traducibles (`site_name`, `meta_title`, etiquetas de menús `label`, `footer_text`, etc.).
4. **Nota técnica**: Los enlaces (URLs), imágenes y opciones booleanas no se marcan como traducibles en los schemas para mantener la consistencia estructural.

## 7. Probar en local

1. Asegúrate de tener tu `.env` con los tokens de Storyblok correctos.
2. Tras crear, rellenar y publicar la historia `settings/global-config` en Storyblok, ejecuta en tu terminal:
   ```bash
   npm run dev
   ```
3. Navega a `http://localhost:4321/` y `http://localhost:4321/en/`.
4. Deberías ver cómo el `<Header />`, `<Footer />` y el HTML `<head>` reflejan los datos globales rellenados, respetando el idioma actual de la URL.
