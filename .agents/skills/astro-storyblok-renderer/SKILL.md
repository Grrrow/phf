---
name: astro-storyblok-renderer
description: Use this skill to create and refine the Astro components that render Storyblok blocks.
---

# Astro Storyblok Renderer Skill

This skill guides the creation of high-quality Astro components for rendering Storyblok data.

## Instructions
When creating or updating an Astro component for a Storyblok block, you MUST:
1. **Clean & Accessible Code:** Create Astro components that are clean, semantic, and accessible.
2. **Main Prop:** Expect `blok` as the main prop containing the Storyblok data.
3. **Storyblok Editable:** Apply the `storyblokEditable` directive to the root element of the component if the project uses it for the Visual Editor.
4. **Render Assets:** Render images, rich text, links, buttons, and nested bloks correctly using the appropriate Storyblok Astro helpers if available (e.g., `<StoryblokComponent blok={nestedBlok} />`).
5. **Minimize Logic:** Avoid excessive logic within the component; keep it focused on presentation.
6. **Semantic Classes:** Prepare semantic CSS classes or Tailwind classes without imposing a strictly closed visual design, allowing for future styling flexibility.
