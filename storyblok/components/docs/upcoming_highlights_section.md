# Upcoming Highlights Section

The **Upcoming Highlights Section** is a reusable editorial component designed to showcase a curated list of important upcoming events, performances, or milestones.

## Usage
This section is nestable and can be added to the `body` field of any root page (e.g., Home, Agenda, Artist Page). It is not restricted to a specific page type, making it highly versatile for highlighting key moments across the site.

## Fields Configuration

### Header Fields
- **Eyebrow** *(translatable)*: Small text above the title, useful for categorization (e.g., "Season 24/25").
- **Title** *(translatable)*: The main section heading (e.g., "Upcoming Highlights").
- **Subtitle** *(translatable)*: A brief descriptive paragraph below the title.

### Content
- **Items**: A list of nested `event_highlight_item` blocks. Only this block type is permitted here.
- **Max Items**: (Optional) A numeric limit on how many items to display. This is enforced at the Astro component level.

### Call To Action (CTA)
- **CTA Label** *(translatable)*: The text for the button (e.g., "View Full Agenda").
- **CTA Link**: The destination URL. If both the label and link are provided, the CTA will appear in the top-right of the header area.

### Design Options
- **Layout Variant**: Choose between `Editorial List` (default), `Compact List`, or `Agenda Preview`. This applies specific CSS classes for future design variations.
- **Theme**: Toggle between `Light` (default) and `Dark` to invert the section's background and text colors.

## Best Practices
- **Do not overload the list**: This section is meant for *highlights*. Keep the number of items between 3 and 6. Use the CTA to link to the full agenda.
- **Translations**: Always ensure the text fields are translated in Storyblok's UI. The design options (`theme`, `layout_variant`, `items`) are non-translatable and apply across all languages.
