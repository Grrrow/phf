# Storyblok Global Schemas

This document explains the architecture for our global configuration in Storyblok, which controls sitewide SEO, identity, header, and footer configurations.

## Architecture: The `global_config` Singleton

In Astro, every page needs a layout, a header, a footer, and SEO tags. Rather than duplicating these blocks into every single page inside Storyblok, we created a single root component: `global_config`.

### How to use it in Storyblok:
1. In the Storyblok interface, create a new folder called **"Settings"** (`settings`).
2. Inside that folder, create a new story named **"Global Config"** with the slug `global-config`.
3. The content type (Content-Type) for this story must be `global_config`.
4. Now, this single story acts as the global settings singleton. You can fill out the `Header`, `Footer`, `SEO Defaults`, `Site Identity`, etc.

Our Astro catch-all route (`[...slug].astro`) will automatically fetch this story (`settings/global-config`) for every page load and pass its configuration down to the `BaseLayout`.

## Component Schema Breakdown

We split the global configuration into multiple **nestable** components so they are easier to manage and reusable:

- **`site_identity`**: Defines the site name, logos, and organization data for Schema.org.
- **`seo`**: A nestable block that can be placed both in `global_config` (as fallbacks) and directly on any page to override the fallback SEO.
- **`header_config`**: Configuration for the site's top navigation bar (logo, links, call-to-action button, language switcher toggle).
- **`footer_config`**: Configuration for the site's footer (legal links, social profiles, copyright text).
- **`navigation_menu` & `navigation_item`**: Used to build nested link structures.
- **`social_profiles` & `social_profile_link`**: Predefined selectors for major social networks with custom icons.
- **`contact_info`**: Structured data for management, booking, press emails, etc.

## Bilingual Support (Translations)

Almost all visible text fields inside these schemas are marked as `translatable: true`. 
When you switch languages inside Storyblok (e.g., from Default/Spanish to English), you will be able to translate the `menu_name`, `label`, `seo_title`, and other editorial texts directly.

The `Header.astro` and `Footer.astro` components read the translated blocks automatically based on the URL context.

## Next Steps

1. Run the `npm run storyblok:push` command locally (after confirming with the prompt) to synchronize these schemas with your Storyblok space.
2. Log into Storyblok and create the `settings/global-config` story as described above.
3. Fill out the Spanish (default) content.
4. Switch the language to English and provide the translated labels.
