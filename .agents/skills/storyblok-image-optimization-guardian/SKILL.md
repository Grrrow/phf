---
name: storyblok-image-optimization-guardian
description: Use this skill when working with Storyblok assets, Storyblok Image Service URLs, responsive images, focal points, image quality, image resizing, image crops, LCP images, galleries, cards, media sections or any Astro component rendering Storyblok images.
---

# Storyblok Image Optimization Guardian Skill

This skill ensures that all images originating from the Storyblok CMS are rendered using optimized, modern web formats, prevent Layout Shift (CLS), load efficiently according to page fold layout priority (LCP), and maintain WCAG accessibility compliance.

## Instructions

When working with Storyblok image assets, you MUST adhere to the following rules:

### 1. Centralized Component Rendering
*   **Never render raw CDN URLs directly**: Do not use `<img src={blok.image.filename}>`.
*   **Use `<StoryblokImage />`**: Always import and use `src/components/media/StoryblokImage.astro` for all dynamic imagery.
*   **Use Utilities**: For background styling, canvas, or complex layouts, use functions in `src/utils/storyblok-image.ts` (like `getStoryblokImageUrl`).

### 2. Dimension and Layout Control (CLS Prevention)
*   **Provide Width/Height**: Pass `width` and/or `height` values corresponding to the layout container.
*   **Dynamic Ratio**: If only one dimension is supplied, the component will automatically calculate the other using the original image metadata.
*   **Aspect Ratio**: If dimensions are unknown, use the `aspectRatio` property (e.g. `aspectRatio="16:9"`) to reserve visual space and prevent Layout Shift.

### 3. Responsive Images & Bandwidth Control
*   **Define Widths & Sizes**: Use the `widths` (array of numbers) and `sizes` (media queries) props so browsers download appropriate image sizes.
*   **Standard Profiles**:
    *   *Hero full width*: `widths={[768, 1024, 1440, 1920]} sizes="100vw"`
    *   *Grid split 50%*: `widths={[480, 768, 1024, 1280]} sizes="(min-width: 1024px) 50vw, 100vw"`
    *   *Content Card*: `widths={[320, 480, 640, 800]} sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"`
    *   *Thumbnail*: `width={160} height={160} crop="smart"`

### 4. Fold Priority (LCP vs. Lazy)
*   **LCP Images**: If an image is part of a Hero or sits above the fold, set `isLcp={true}`. This configures `loading="eager"` and `fetchpriority="high"`.
*   **Lazy Loading**: For all other images (below the fold, grids, galleries), leave `isLcp={false}` to allow `loading="lazy"` and `decoding="async"` (default behavior).

### 5. Formats & Quality
*   **Modern Formats**: Default to `'webp'`. Allow formatting overrides if necessary.
*   **Quality Budgets**:
    *   *Hero/LCP*: Quality 80
    *   *Editorial*: Quality 78-82
    *   *Cards*: Quality 72-78
    *   *Thumbnails*: Quality 65-75

### 6. Focal Points & Smart Cropping
*   **CMS Focal Point**: If an editor configures a focal point in Storyblok, pass the full `image` object to `<StoryblokImage />` so it extracts coordinates automatically.
*   **Smart Crop**: For portrait images or faces, default to `crop="smart"` if no manual focal point coordinates are defined.

### 7. Accessibility
*   **Informativa**: Ensure images that add content value have an editable and translatable `image_alt` field in the Storyblok component schema.
*   **Decorativa**: If an image is illustrative, set `decorative={true}` to generate an empty `alt=""`.

---

## Storyblok Image Review Checklist (Mandatory)

Run this checklist on any code containing images:
1. Does the image use `<StoryblokImage />` or `getStoryblokImageUrl`?
2. If it is an LCP image, is `isLcp={true}` specified?
3. If it is below the fold, is it lazy loaded with async decoding?
4. Are `widths` and `sizes` defined for responsive layouts?
5. Does it have explicit dimensions or an aspect-ratio stylesheet to prevent CLS?
6. Is the `image_alt` text translatable and editable from Storyblok?
7. If decorative, is `decorative={true}` passed?
8. Are you avoiding double-processing (e.g. not passing a URL that already contains `/m/`)?
