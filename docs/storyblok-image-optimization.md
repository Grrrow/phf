# Storyblok Image Optimization Guide

Este documento sirve como guía técnica sobre cómo utilizar el **Storyblok Image Service** y las herramientas disponibles en el proyecto (`StoryblokImage.astro` y `storyblok-image.ts`) para optimizar imágenes y garantizar el mejor rendimiento web.

---

## 1. ¿Qué es Storyblok Image Service?

Storyblok aloja todos sus assets de imagen en un CDN de alto rendimiento (`a.storyblok.com`). Además, ofrece un servicio de procesamiento en tiempo real (Image Service) que te permite redimensionar, recortar, comprimir y cambiar el formato de las imágenes simplemente modificando su URL.

### El error común: Usar la URL original
El panel de Storyblok proporciona la URL original del archivo cargado por el redactor:
`https://a.storyblok.com/f/12345/3000x2000/abcdef/photo.jpg`

Si pones esta URL directamente en el atributo `src` de tu imagen:
1.  **Desperdicias ancho de banda**: Estás sirviendo una imagen de 3000px (que puede pesar más de 3MB) a un usuario móvil que solo la ve en una pantalla de 375px de ancho.
2.  **Penalizas el LCP**: El navegador tardará segundos en descargar un archivo gigante.
3.  **Generas CLS**: Al no redimensionar ni especificar dimensiones, la página dará saltos de layout durante la descarga.

---

## 2. Componente Centralizado: `<StoryblokImage />`

Para automatizar la optimización, se utiliza el componente `<StoryblokImage />` localizado en `src/components/media/StoryblokImage.astro`.

### Ejemplo básico:
```astro
---
import StoryblokImage from '../media/StoryblokImage.astro';
---
<StoryblokImage
  image={blok.card_image}
  width={400}
  height={300}
  alt={blok.card_image_alt}
/>
```

### Propiedades clave:
*   `image`: El objeto de imagen proveniente de Storyblok (ej. `blok.image`).
*   `src`: Ruta directa de la imagen (alternativa si no se pasa el objeto `image`).
*   `width` / `height`: Dimensiones en píxeles. Si solo defines una (ej. `width={600}`), el componente calcula automáticamente la otra en base al ratio de la imagen original.
*   `isLcp`: Pásalo como `true` si la imagen está *above the fold* (en el primer pantallazo, ej. la imagen de cabecera/hero). Esto desactiva el lazy-loading y le asigna prioridad de carga alta (`fetchpriority="high"`).
*   `widths`: Un array de anchos (ej. `[320, 480, 800]`) para generar un `srcset` responsivo.
*   `sizes`: Atributo CSS `sizes` complementario para el `srcset`.
*   `decorative`: Define `true` si la imagen es puramente decorativa (se renderizará con `alt=""` para lectores de pantalla).

---

## 3. Guía de Dimensiones y Formatos Recomendados

### 3.1. Tamaños Recomendados por Contexto

*   **Hero Full-Width (LCP)**:
    *   `widths`: `[768, 1024, 1440, 1920]`
    *   `sizes`: `"100vw"`
    *   `quality`: `80`
    *   `isLcp`: `true`

*   **Imagen Media en Grid Split (50% pantalla en Desktop)**:
    *   `widths`: `[480, 768, 1024, 1280]`
    *   `sizes`: `"(min-width: 1024px) 50vw, 100vw"`
    *   `quality`: `78`

*   **Cards de Contenido (3 columnas en Desktop)**:
    *   `widths`: `[320, 480, 640, 800]`
    *   `sizes`: `"(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"`
    *   `quality`: `75`

*   **Miniaturas / Avatares / Thumbnails**:
    *   `width`: `150`
    *   `height`: `150`
    *   `quality`: `70`
    *   `crop`: `"smart"`

---

## 4. Recortes (Crops) y Puntos de Enfoque (Focal Points)

Cuando las proporciones de visualización cambian (ej. de una foto horizontal en desktop a una caja cuadrada en mobile), corremos el riesgo de recortar partes importantes de la imagen (como la cara de un artista).

El componente gestiona esto automáticamente de tres maneras a través de la propiedad `crop`:

1.  **Focal Point (Recomendado)**: Si el redactor de contenido ha definido un punto de enfoque en la interfaz de Storyblok, el componente lo detecta (`image.focus`) y aplica el recorte centrado en esas coordenadas exactas (`crop="focal"`).
2.  **Smart Crop (`crop="smart"`)**: Storyblok analiza la imagen y detecta rostros automáticamente para evitar recortar cabezas.
3.  **Manual (`crop="manual"`)**: Puedes forzar tus propias coordenadas de enfoque pasando la prop `focalPoint="500x300"`.

---

## 5. Accesibilidad e Internacionalización del Alt Text

*   **Imágenes Informativas**: Toda imagen que aporte valor comunicativo debe llevar texto alternativo descriptivo. En el CMS, asegúrate de crear el campo `image_alt` de tipo texto y marcarlo como **Translatable** para que se traduzca correctamente a español e inglés.
*   **Imágenes Decorativas**: Si la imagen es puramente de fondo o ilustrativa sin contenido real, usa `decorative={true}`. Esto fuerza un `alt=""`, cumpliendo con las directrices de accesibilidad WCAG.

---

## 6. Checklist de Validación para Desarrolladores

Cada vez que implementes una sección visual con imágenes, debes hacerte estas preguntas:

- [ ] ¿He utilizado `<StoryblokImage />` en lugar de una etiqueta `<img>` nativa?
- [ ] ¿He configurado `isLcp={true}` si la imagen forma parte del Hero o sección superior?
- [ ] Si es una imagen secundaria, ¿se está cargando con `loading="lazy"` por defecto?
- [ ] ¿He especificado al menos `width` o `aspectRatio` para reservar espacio y evitar CLS?
- [ ] ¿Las imágenes responsivas tienen definidos `widths` y `sizes` óptimos para evitar descargar archivos gigantes?
- [ ] ¿El campo de texto alternativo (`image_alt`) está configurado como traducible en el panel de Storyblok?
