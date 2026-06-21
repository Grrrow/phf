---
name: storyblok-block-generator
description: Use this skill when the user wants to create a new Storyblok block/component schema and the matching Astro component.
---

# Storyblok Block Generator Skill

This skill guides the agent to create new Storyblok blocks effectively.

## Instructions
When instructed to create a new Storyblok block, you MUST:
1. **Create the Storyblok Block:** Generate the logical structure for the new block.
2. **Generate the JSON Schema:** Create the schema in `/storyblok/components/schemas/[block_name].json`. Ensure `snake_case` is used for the file name and the `component.name` property.
3. **Generate the Astro Component:** Create the corresponding Astro component in `/src/components/storyblok/[BlockName].astro`. Convert the `snake_case` block name to `PascalCase` for the Astro component file name.
4. **Generate Documentation:** Create a Markdown file documenting the block, its fields, and usage.
5. **Register the Component:** If a component map exists, add the new component to it, maintaining alphabetical order.
6. **Pre-flight Check:** Do NOT overwrite existing files without reviewing them and asking for user permission first.
