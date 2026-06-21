# Agenda Events Section

## Descripción General
Este es el contenedor padre que agrupa y formatea la lista de conciertos dentro de la página de Agenda. En lugar de crear un diseño desde cero, reutiliza inteligentemente los bloques `Event Highlight Item`.

## Configuración y Reglas
- **Titles**: Soporta un pequeño `eyebrow` (ej. "Season 2024"), un título opcional y un subtítulo si necesitas dividir la agenda en varias secciones (por ejemplo: "Operas" y luego otra sección de "Symphonic Concerts").
- **Items**: Simplemente añade bloques `Event Highlight Item`. ¡El sistema es lo suficientemente inteligente para reconocer que están dentro de la agenda y renderizará automáticamente sus botones como marcos contorneados en lugar de enlaces de texto simples!
- **Empty State Text**: Si la agenda está vacía, mostrará el texto que definas aquí (ej. "There are no upcoming events at this moment.").
