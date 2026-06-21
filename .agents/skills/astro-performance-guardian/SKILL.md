---
name: astro-performance-guardian
description: Use this skill when creating or reviewing Astro components, Storyblok blocks, image rendering, layout performance, Core Web Vitals, SEO technical structure, or accessibility.
---

# Astro Performance Guardian Skill

This skill ensures that all newly created or modified Astro components and Storyblok blocks adhere to web performance best practices, Core Web Vitals targets, technical SEO standards, and accessibility guidelines.

## Instructions

When creating, reviewing, or refactoring components, you MUST execute the following instructions:

### 1. Astro Component & JavaScript Optimization
*   **Static Rendering**: Keep components static (.astro) by default. Avoid importing or injecting client-side JavaScript unless explicitly required for interactivity.
*   **Partial Hydration**: When React/Svelte/Solid components or custom interactive scripts are necessary, use the most conservative hydration directive (e.g., `client:visible` or `client:idle` instead of `client:load`).
*   **No Unnecessary client:* Directives**: Do not use client-side hydration directives on purely informational components.

### 2. Storyblok Image Optimization
*   **Use StoryblokImage**: Always use the custom component `src/components/media/StoryblokImage.astro` to render images coming from Storyblok asset fields. Never use a raw `<img>` tag for CMS-managed images.
*   **Specify Dimensions**: Always provide either `width` and `height`, or an `aspectRatio` property to reserve space for the image. The `StoryblokImage` component will automatically calculate the missing dimension if only one is provided to preserve the aspect ratio and prevent Layout Shift (CLS).
*   **Responsive Images**: Use the `widths` and `sizes` props for responsive layouts so that images are not served in resolutions larger than their display container.
*   **Focal Points**: Ensure that `StoryblokImage` receives the `image` object (which contains the `focus` coordinate property configured by editors) rather than just a string URL, enabling automatic cropping alignment.
*   **Alt Text Translation**: In Storyblok JSON schemas, ensure any `image_alt` fields are configured as `translatable: true` and labeled clearly.

### 3. LCP / Hero Images (Above the Fold)
*   **Eager Loading**: Never use `loading="lazy"` on LCP or hero images. Set `loading="eager"` explicitly.
*   **Fetch Priority**: Set `fetchpriority="high"` on the main hero image to prioritize its download.
*   **No Background Images**: Avoid CSS `background-image` for LCP images. Use an absolute positioned `<StoryblokImage />` inside a container.

### 4. Non-Critical Images (Below the Fold / Galleries)
*   **Lazy Loading**: Ensure all images below the fold have `loading="lazy"` (default in `StoryblokImage.astro`).
*   **Async Decoding**: Ensure images below the fold have `decoding="async"` (default in `StoryblokImage.astro`).
*   **Carousel/Tabs**: Avoid loading hidden images inside inactive tabs or carousels until they become visible.

### 5. Layout & CLS Prevention
*   **Explicit Dimensions**: Ensure images, iframes, and dynamic content blocks have a defined aspect ratio or dimensions.
*   **Safe Containers**: Use stable CSS layouts to prevent elements from jumping when dynamic content finishes loading.

### 6. Accessibility & Semantic HTML
*   **Semantic Structure**: Use semantically correct tags (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`).
*   **Heading Hierarchy**: Ensure there is only one `<h1>` per page. Sub-headings must follow a logical hierarchy (`<h2>` -> `<h3>` -> `<h4>`) without skipping levels.
*   **Descriptive Buttons & Links**: Use `<button>` for actions and `<a>` for navigation. Label links clearly; avoid generic "Click here" texts.
*   **Aria Labels**: Provide `aria-label` for icons or elements lacking visible text.

### 7. Performance Review Checklist (Mandatory)
Every time you commit changes to a component or block, verify:
1. Is this block static? (Zero client-side JS preferred).
2. Are all CMS-managed images utilizing `<StoryblokImage />`?
3. Are hero/LCP images set to `loading="eager"` and `fetchpriority="high"`?
4. Are non-critical images set to `loading="lazy"` and `decoding="async"`?
5. Do all images have dimensions or aspect ratio defined?
6. Are image alt texts editable and translatable in Storyblok schemas?
7. Is the heading structure semantically correct?
8. Are all links accessible and interactive controls semantically valid?
