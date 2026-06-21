# Event Highlight Item

The **Event Highlight Item** represents a single event row within the `upcoming_highlights_section`. It is designed with a highly editorial, 3-column layout (on desktop) and a clean stacked layout on mobile.

## Fields Configuration

### Date Presentation
*Note: The visible date fields are text-based, not strict Date pickers. This is intentional to support complex or ambiguous dates.*

- **Date Label** *(translatable)*: The primary, large date text.
  - *Examples:* "Nov 15", "15–20 November", "Spring 2025".
- **Date Sublabel** *(translatable)*: The smaller text below the main date.
  - *Examples:* "2024", "Season 2024/25", "Premiere".
- **Sort Date**: A standard `datetime` field used *only* for internal sorting if required by future query logic. This date is **never** rendered on the screen.

### Event Content
- **Title** *(translatable)*: The main event name (e.g., "Symphony No. 5").
- **Subtitle** *(translatable)*: Additional context, such as the orchestra or venue hall (e.g., "London Symphony Orchestra").

### Meta Information
- **Location Label** *(translatable)*: The city, country, or venue name. Renders with a small pin icon.
  - *Examples:* "London, UK", "Teatro Real".
- **Details Label** *(translatable)*: The text for the action link (e.g., "Details", "Tickets").
- **Details Link**: The destination URL. If this is omitted but the label is present, the label renders as static text (useful for "Sold out" or "TBA" notices).
- **Status**: Controls visual styling. Options include `Upcoming`, `Available`, `Sold Out`, `Cancelled`, and `Past`. (e.g., `Cancelled` will strike through the title).
- **Open in New Tab**: If checked, the Details link opens in a new browser tab.

## Translation Rules
All visible text fields (`date_label`, `date_sublabel`, `title`, `subtitle`, `location_label`, `details_label`) are **translatable** because date formats and venue names often change between languages (e.g., "London" vs "Londres"). The `status`, `sort_date`, and links are shared across all locales.

## Agenda Context Variant
Este bloque ha sido diseñado para ser **polimórfico**. Esto significa que si lo insertas dentro de la sección "Upcoming Highlights" de la Home tendrá un aspecto visual determinado, pero si lo insertas dentro de una "Agenda Events Section", cambiará automáticamente su estética sin que tengas que configurar nada extra.

### Consejos para la Agenda:
- **Date Label**: Úsalo para la fecha o rango corto (ej. `Oct 12`, `Nov 15-20`).
- **Date Sublabel**: Úsalo para el año y la hora (ej. `2024 · 20:00`).
- **Details y Sold Out**:
  - Si el evento está a la venta: Rellena el campo `details_label` con "Tickets / Info" y pon la URL en `details_link`. Se mostrará como un botón *outline* elegante.
  - Si el evento está agotado: Pon el `status` en `Sold Out`, quita la URL y pon "SOLD OUT" en el `details_label`. Se renderizará como un texto plano gris (sin ser botón) tal como dicta el diseño editorial.
  - Para eventos pasados (`Past`) o cancelados (`Cancelled`), el título y la fecha aparecerán en gris apagado automáticamente.
