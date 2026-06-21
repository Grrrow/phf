# SEO & i18n Architecture

This document outlines the foundation of the bilingual routing and SEO capabilities for the Astro + Storyblok project.

## 🌍 Internationalization (i18n)

The project is configured for two languages:
- **Spanish (`es`)**: The default and primary language. It does not use a URL prefix (e.g., `/biografia`).
- **English (`en`)**: The secondary language. It uses the `/en/` prefix (e.g., `/en/biography`).

### Configuration
- `src/i18n/config.ts`: Defines the supported locales and their paths.
- `src/i18n/utils.ts`: Provides helper functions:
  - `getLocaleFromUrl(url)`: Detects the language based on the URL path.
  - `getLocalizedPath(path, locale)`: Swaps the locale prefix to build language-switcher links.

### Routing
The entire site routing is handled by the catch-all dynamic route `src/pages/[...slug].astro`.
1. It extracts the slug and detects the locale.
2. If the locale is `en`, it queries the Storyblok API with `language: 'en'`. If `es` (default), it omits the language parameter (or uses `default`).
3. If the page isn't found, it falls back to a 404.

## 🔍 SEO Architecture

A robust technical SEO foundation has been established to ensure maximum visibility.

### `SeoHead.astro`
Located in `src/components/seo/SeoHead.astro`, this component is injected into the `<head>` of every page via `BaseLayout.astro`. It handles:
- Title and Meta Description formatting.
- `canonical` tags (using the `PUBLIC_SITE_URL` from `.env`).
- Open Graph (`og:title`, `og:image`, etc.) and Twitter Cards.
- `robots` meta tags for indexing control.
- `hreflang` alternate tags to tell search engines about the ES/EN variants.
- JSON-LD structured data injection.

### SEO Fallback Logic
We implemented `mergeSeo()` in `src/utils/seo.ts`. This allows individual pages in Storyblok to define their own specific SEO metadata. If a page doesn't define a specific field (like a fallback Open Graph image), it can inherit it from a `global_config` Storyblok block.

### Structured Data (JSON-LD)
We created `src/components/seo/JsonLd.astro` and helper functions in `src/utils/schema.ts` to easily generate structured data (like `WebSite`, `Person`, `BreadcrumbList`). These will be expanded in future phases as content is modeled in Storyblok.

## 🏗 Global Components
- **`BaseLayout.astro`**: The master layout. It sets `<html lang="...">` dynamically, includes `SeoHead`, and wraps the content between the `Header` and `Footer`.
- **`Header.astro` & `Footer.astro`**: Global UI components. They are prepared to receive navigation links and configuration from Storyblok.
- **`LanguageSwitcher.astro`**: A drop-in component that automatically generates links to switch between the ES and EN versions of the current page.

## 🚀 Next Steps
In the next phase, we need to create the actual schemas in Storyblok for:
- `global_config`, `header_config`, `footer_config`
- The `seo` nestable block.
- And map the remaining page structures so the data can flow from the CMS into this Astro architecture.
