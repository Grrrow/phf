---
name: storyblok-schema-validator
description: Use this skill to validate all local Storyblok schemas for correctness, consistency, and completeness before pushing to Storyblok.
---

# Storyblok Schema Validator Skill

This skill ensures that Storyblok schemas are valid and aligned with the project's standards.

## Instructions
When instructed to validate Storyblok schemas, you MUST:
1. **Review Local Schemas:** Iterate through all JSON files in `/storyblok/components/schemas/`.
2. **Check Name Consistency:** Verify that the `component.name` inside the JSON matches the file name (excluding the `.json` extension).
3. **Validate Fields:** Ensure all fields defined in the schema have a valid `type` and a `pos` (position) attribute.
4. **Detect Duplicates:** Check for duplicate component names or duplicate field names within a component.
5. **Check Astro Components:** Verify that every schema has a corresponding Astro component in `/src/components/storyblok/`.
6. **Check Documentation:** Verify that documentation exists for each schema.
7. **Recommend Improvements:** Provide a summary of validation errors or warnings and recommend improvements *before* performing a push to Storyblok.
