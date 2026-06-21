# Storyblok Preview & Routing Configuration

This document describes the routing architecture, slug normalization conventions, and Visual Editor Preview setup for this bilingual Astro + Storyblok project.

---

## 1. Slug & URL Conventions

The project supports two locales: **Spanish (ES)** as the default locale, and **English (EN)**.

| Locale | User-facing URL | Storyblok Story Slug | Astro Dynamic Parameter (`Astro.params.slug`) |
| :--- | :--- | :--- | :--- |
| **Spanish Home** | `/` | `home` | `undefined` |
| **English Home** | `/en/` | `home` (with English translation) | `en` |
| **Spanish Preview** | `/home` | `home` | `home` |
| **English Preview** | `/en/home` | `home` (with English translation) | `en/home` |

---

## 2. Astro Catch-All Routing (`[...slug].astro`)

All pages are resolved via the single catch-all file `src/pages/[...slug].astro`.

### static paths (`getStaticPaths()`)
To support both the clean public URLs (`/` and `/en/`) and the Storyblok Visual Editor preview iframe paths (`/home` and `/en/home`), the router generates the following route params for the Home page:
- `{ slug: undefined }` (Spanish public Home)
- `{ slug: 'en' }` (English public Home)
- `{ slug: 'home' }` (Spanish preview Home)
- `{ slug: 'en/home' }` (English preview Home)

### Slug Normalization Logic
Before calling the Storyblok API, the URL slug parameter is normalized into the story slug:
```javascript
let cleanSlug = slug;
if (cleanSlug.startsWith('en/')) {
  cleanSlug = cleanSlug.replace(/^en\//, '') || 'home';
} else if (cleanSlug === 'en') {
  cleanSlug = 'home';
}
```
This maps both `/en/` (`en`) and `/en/home` to the `home` story with the language parameter set to `en`.

---

## 3. Draft vs Published Content Fetching

We request content from Storyblok's CDN using either `draft` or `published` versions based on the request environment:
1. **Preview Mode**: If the URL contains the `_storyblok` query parameter (appended automatically by the Visual Editor) OR if the project is running in local development mode (`import.meta.env.DEV`), we fetch `version: 'draft'`.
2. **Production Mode**: Otherwise, we fetch `version: 'published'`.

```javascript
const isPreview = url.searchParams.has('_storyblok') || import.meta.env.DEV;
const version = isPreview ? 'draft' : 'published';
```

This guarantees real-time editing previews in the Storyblok editor and on staging builds without exposing draft content to production site visitors.

---

## 4. Public Route Redirects

To prevent `/home` and `/en/home` from being accessible as duplicate public paths in search engines or to end-users, we inject an inline client-side script into the layout for those slugs:

```html
<script is:inline>
  const cleanPath = window.location.pathname.replace(/\/$/, '');
  if ((cleanPath === '/home' || cleanPath === '/en/home') && !window.location.search.includes('_storyblok') && window.self === window.top) {
    const isEn = cleanPath.startsWith('/en');
    window.location.replace(isEn ? '/en/' : '/');
  }
</script>
```

- **Live Users**: Direct visitors to `/home` or `/en/home` are redirected to `/` and `/en/` respectively.
- **Storyblok Visual Editor**: Since the page is loaded in an iframe (`window.self !== window.top`) and has the `_storyblok` query param, the redirect is bypassed, allowing the editor to load the preview correctly.

---

## 5. Storyblok Space Setup

To configure the Visual Editor in your Storyblok Space Settings:

1. **Go to** your Storyblok Space -> **Settings** -> **Visual Editor**.
2. **Set the Default Preview URL** to your hosting domain:
   - For local development: `https://localhost:4321/`
   - For staging/production: `https://<your-staging-domain>/`
3. In the Story list, make sure the **Home** story slug is set to `home`.
4. When you edit the **Home** story in Spanish, Storyblok will open `https://localhost:4321/home?_storyblok=...`, resolving the Spanish home.
5. When you edit the **Home** story in English, Storyblok will open `https://localhost:4321/en/home?_storyblok=...`, resolving the English home.
