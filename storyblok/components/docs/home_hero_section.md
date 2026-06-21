# Home Hero Section

## Propósito
Este bloque está diseñado exclusivamente para ser la primera sección (Hero) de la página de inicio (Home). Presenta un diseño editorial de dos columnas muy limpio y espacioso, destacando una imagen grande, un título elegante y una llamada a la acción.

## Dónde usarlo
- **Permitido**: Únicamente como el primer componente anidado (`is_nestable: true`) dentro de la página Home.
- **Evitar**: No usar en subpáginas regulares ni duplicarlo en la Home.

## Campos Disponibles
- **Eyebrow** (`text` - *Traduccible*): Pequeño texto en mayúsculas que aparece encima del título. Útil para subtítulos o temáticas.
- **Title** (`text` - *Traduccible*): Título principal del Hero. Se renderizará con tipografía Serif elegante y gran tamaño.
- **Description** (`textarea` - *Traduccible*): Párrafo descriptivo introductorio. Se limitará su ancho para facilitar la lectura.
- **CTA Text** (`text` - *Traduccible*): Texto del botón o enlace inferior (ej. "Discover biography").
- **CTA Link** (`multilink`): Enlace de destino del botón. Puede ser una página interna de Storyblok o una URL externa.
- **Image** (`asset`): Imagen principal del director. Se mostrará automáticamente en escala de grises.
- **Image Alt** (`text` - *Traduccible*): Texto alternativo para accesibilidad y SEO de la imagen. **Obligatorio rellenarlo**.

## Notas sobre Rendimiento (LCP & Core Web Vitals)
- **Imagen Crítica (LCP)**: Al ser el componente de cabecera, la imagen (`image`) se renderizará automáticamente con `loading="eager"` y `fetchpriority="high"`.
- **Responsive**: La imagen utiliza `widths` y `sizes` para no descargar resoluciones innecesarias en móviles.
- **No usar Background Images**: La imagen se inyecta mediante HTML `<img />` optimizado a través del componente `<StoryblokImage />` para garantizar su rápida detección por el parser del navegador.

## Internacionalización (i18n)
Asegúrese de definir los textos (`eyebrow`, `title`, `description`, `cta_text`, `image_alt`) usando la vista de idioma correcta en la interfaz de Storyblok.
