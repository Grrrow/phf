# Agenda Page

## Descripción General
Esta es la página raíz diseñada para mostrar el calendario principal y completo de la agenda del artista. Tiene un diseño editorial, sobrio y basado en listas que permite organizar grandes volúmenes de conciertos o eventos.

## Cómo Crear la Página en Storyblok
1. Crea una nueva Story y selecciona `agenda_page` como Content Type.
2. Nómbrala "Agenda".
3. El Slug recomendado es `/agenda/` (tanto para inglés como para español).
4. Configura el bloque `seo` para asegurar que indexe correctamente en buscadores.
5. Usa la barra superior de idiomas de Storyblok para traducir los textos visibles (título e introducción).

## Estructura
- **Title e Intro**: Obligatorios para dar contexto.
- **Hero Image**: Soporta el uso del bloque `editorial_image_section`. Esto te permite añadir la gran fotografía apaisada bajo la introducción sin duplicar esfuerzos técnicos.
- **Events Section**: Aquí es donde debes anidar el bloque `agenda_events_section`, que será el contenedor de toda la lista de eventos.
