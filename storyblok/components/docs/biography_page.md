# Biography Page

## Descripción General
Esta es la página principal (`root`) diseñada para contar la historia vital y profesional del artista. Está concebida como un lienzo en blanco (con un fondo "editorial" gris muy claro) en el cual se pueden apilar diferentes bloques narrativos de forma modular.

## Cómo Crear la Página en Storyblok
1. Crea una nueva Story y selecciona `biography_page` como Content Type.
2. Nómbrala "Biography" o "Biografía".
3. El Slug recomendado es `/biography/` (para inglés) o `/biografia/` (para español).
4. La arquitectura permite Field-Level Translation, así que no dupliques la página; simplemente cambia el idioma en el selector superior de Storyblok y traduce los textos.

## Estructura (Body)
El campo `body` acepta los siguientes bloques, que puedes reordenar libremente:
- **Biography Hero Section**: Recomendado siempre como primer bloque para presentar la gran foto de portada.
- **Editorial Text Section**: Para los párrafos narrativos.
- **Editorial Image Section**: Para intercalar fotografías grandes horizontales o verticales.
- **Career Highlights Section**: Para listar la cronología o hitos de su carrera.
