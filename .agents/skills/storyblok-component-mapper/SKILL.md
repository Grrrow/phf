---
name: storyblok-component-mapper
description: Use this skill to register a newly created Storyblok component within the Astro project so it can be rendered dynamically.
---

# Storyblok Component Mapper Skill

This skill handles the integration of new Astro components into the Storyblok rendering map.

## Instructions
When instructed to map or register a Storyblok component, you MUST:
1. **Locate Registration Point:** Find where Storyblok components are registered in the Astro project (e.g., `storyblokInit`, `StoryblokComponent`, custom resolver, or a dedicated component map file).
2. **Add Imports:** Automatically add the import statement for the new Astro component.
3. **Update the Map:** Add the block to the component map or registry.
4. **Maintain Order:** Keep the component map and imports sorted alphabetically to maintain a clean codebase.
5. **Preserve Integration:** Ensure the existing integration is not broken by your changes. Adapt to the specific method used in the project (e.g., `components: { ... }` in `storyblokInit`).
