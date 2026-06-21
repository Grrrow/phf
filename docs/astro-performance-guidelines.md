# Astro Performance and Core Web Vitals Guidelines

Este documento recoge las directrices obligatorias de rendimiento, optimización de imágenes y accesibilidad para el proyecto Astro + Storyblok, garantizando una puntuación óptima en Core Web Vitals (LCP, CLS, INP) y SEO Técnico.

---

## 1. Buenas Prácticas Generales de Astro

Astro destaca por enviar cero JavaScript al cliente por defecto. Mantengamos esa ventaja competitiva:

*   **Componentes Estáticos por Defecto**: Todos los componentes visuales de Storyblok deben crearse como componentes estáticos de Astro (.astro) a menos que requieran interactividad en el cliente (como un formulario reactivo o un menú móvil dinámico).
*   **Hidratación Parcial**: Si un componente requiere interactividad en cliente, encapsula solo la parte interactiva (ej. en un componente React/Svelte/Solid si se integran, o usando vanilla JS encapsulado) y utiliza la directiva de hidratación adecuada (como `client:visible` o `client:idle`). Evita `client:load` a menos que sea crítico e interactivo de inmediato.
*   **HTML Semántico**: Diseña layouts limpios y con etiquetas HTML5 semánticas (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`).
*   **Separación de Lógica**: Separa las utilidades, cálculos y formateadores de datos en `/src/utils` en lugar de sobrecargar la sección del frontmatter del componente `.astro`.

---

## 2. Optimización de Imágenes

Las imágenes son la principal causa de ralentización de LCP (Largest Contentful Paint) y desajustes de CLS (Cumulative Layout Shift).

### 2.1. Imágenes Locales del Proyecto
*   Usa el componente oficial de Astro `<Image />` de `astro:assets` para procesar, redimensionar y optimizar imágenes locales almacenadas en el repositorio (ej. en `/src/assets/`).
*   Declara siempre `width` y `height` para reservar el espacio en el layout.
*   Suministra un atributo `alt` descriptivo.

### 2.2. Imágenes Remotas desde Storyblok
*   **No sirvas nunca imágenes sin procesar directas del CDN de Storyblok** (ej. de 3000px si se renderizan en una caja de 400px).
*   Usa el componente unificado `<StoryblokImage />` para todas las imágenes que provengan de campos tipo asset de Storyblok.
*   Mantén siempre el campo `image_alt` editable y traducible en Storyblok cuando la imagen sea editorial.

---

## 3. Uso de `<StoryblokImage />`

El componente `<StoryblokImage />` está disponible en `src/components/media/StoryblokImage.astro`. Centraliza toda la optimización mediante el servicio de imágenes de Storyblok.

### Propiedades Aceptadas:
*   `image`: El objeto asset recibido de Storyblok (ej. `blok.image`) o un string con la URL del CDN.
*   `alt`: Texto descriptivo alternativo (sobrescribe el alt de Storyblok si se especifica).
*   `width` / `height`: Dimensiones deseadas en píxeles. Si solo se proporciona uno de ellos, el componente autocalcula el otro según las dimensiones originales del CDN para mantener la relación de aspecto.
*   `widths`: Un array de números (ej. `[400, 800, 1200]`) para generar un `srcset` responsivo automático.
*   `sizes`: Atributo CSS `sizes` (ej. `(max-width: 768px) 100vw, 50vw`).
*   `loading`: `'lazy'` (por defecto para no críticas) o `'eager'` (para imágenes Above the Fold).
*   `decoding`: `'async'` (por defecto) o `'sync'`.
*   `fetchpriority`: `'high'` (para LCP/Heros) o `'low'`.
*   `aspectRatio`: Aplica una relación de aspecto CSS inline (ej. `'16:9'`).
*   `objectFit`: Aplica un estilo CSS inline de ajuste (ej. `'cover'`).
*   `quality`: Nivel de compresión de 0 a 100 (por defecto `85`).
*   `format`: Formato moderno de imagen (por defecto `'webp'`).
*   `smart`: Activa el recorte inteligente (face detection) de Storyblok (por defecto `true`).

### Ejemplos de Uso:

#### A. Imagen en un bloque Hero (Imagen LCP)
```astro
---
import StoryblokImage from '../media/StoryblokImage.astro';
---
<section class="hero">
  <StoryblokImage
    image={blok.hero_image}
    width={1200}
    height={600}
    loading="eager"
    fetchpriority="high"
    alt={blok.hero_image_alt}
    class="hero-img"
    objectFit="cover"
  />
</section>
```

#### B. Imagen Responsiva en una Tarjeta (Lazy Loading)
```astro
---
import StoryblokImage from '../media/StoryblokImage.astro';
---
<div class="card">
  <StoryblokImage
    image={blok.card_image}
    width={400}
    widths={[300, 400, 600]}
    sizes="(max-width: 768px) 100vw, 33vw"
    loading="lazy"
    alt={blok.card_image_alt}
    class="card-img"
    aspectRatio="4:3"
    objectFit="cover"
  />
</div>
```

---

## 4. Estrategia LCP vs. Lazy Loading

### Reglas para Imagen LCP / Hero (Above the Fold)
1.  **Carga Inmediata**: Prohibido usar `loading="lazy"` para la imagen principal del Hero. Usa siempre `loading="eager"`.
2.  **Prioridad de Descarga**: Añade `fetchpriority="high"` en la imagen LCP principal de la página para que el navegador inicie su descarga antes de procesar scripts secundarios.
3.  **Evitar Layout Shifts (CLS)**: La imagen debe tener dimensiones explícitas (`width` y `height`) o una propiedad `aspect-ratio` estable.
4.  **No usar Background Images**: Evita cargar la imagen principal del Hero mediante la directiva CSS `background-image` en línea, ya que el navegador no podrá iniciar la descarga de manera óptima hasta que parsee las hojas de estilo. Usa siempre una etiqueta `<img>` (o `<StoryblokImage />`) y posiciónala con CSS (`position: absolute; z-index: -1;`).

### Reglas para Imágenes No Críticas (Below the Fold)
1.  **Lazy por defecto**: Todas las imágenes secundarias, galerías, tarjetas, logos del footer o imágenes fuera de pantalla deben llevar `loading="lazy"`.
2.  **Decodificación Asíncrona**: Llevarán siempre `decoding="async"` para evitar bloquear el hilo principal de renderizado del navegador.
3.  **Tamaño ajustado**: No uses la imagen original de la cámara o de diseño. Ajusta el `width` a su contenedor máximo real.

---

## 5. Prevención de CLS (Cumulative Layout Shift)

*   **Espacios Reservados**: Asegúrate de que todos los bloques dinámicos tengan una altura o aspecto mínimo reservado antes de cargar su contenido o imágenes.
*   **Dimensiones de Contenedores**: Usa combinaciones de `aspect-ratio` en CSS junto con `width: 100%; height: auto;` para que la página sea fluida pero estable en todo momento.

---

## 6. Accesibilidad (A11y) y SEO Técnico

*   **Alt Obligatorio**: Todas las imágenes significativas del CMS deben ir acompañadas de un campo `image_alt` editable y traducible en Storyblok. Si una imagen es meramente decorativa, el `alt` puede ir vacío (`alt=""`), pero el atributo debe estar presente.
*   **Jerarquía de Encabezados**: Un solo `<h1>` por página (habitualmente en el Hero principal). Las subsecciones deben usar jerarquías lógicas (`<h2>` para títulos de sección, `<h3>` para títulos de tarjeta/bloque interno) sin saltarse niveles.
*   **Enlaces y Botones**: Los botones (`<button>`) se usan para interacciones JavaScript y acciones de envío. Los enlaces (`<a>`) se usan estrictamente para navegar a otras páginas o secciones (anclas).
*   **Aria-Labels**: Añade `aria-label` descriptivos a menús de navegación, botones de cierre o enlaces tipo icono que no contengan texto visible.

---

## 7. Checklist de Calidad antes de Aprobar una Sección

Antes de dar por finalizada la creación de una sección o bloque visual de la Home, verifica los siguientes puntos:

- [ ] ¿Esta sección usa imágenes?
- [ ] Si usa imágenes, ¿alguna de ellas es LCP (está visible de inmediato en la pantalla al cargar)?
- [ ] Si es LCP, ¿tiene `loading="eager"`, `fetchpriority="high"` y dimensiones definidas para evitar CLS?
- [ ] Si no es LCP, ¿tiene `loading="lazy"` y `decoding="async"`?
- [ ] ¿Se utiliza el componente `<StoryblokImage />` para todas las imágenes del CMS?
- [ ] ¿Las imágenes tienen campos `image_alt` editables y traducibles en Storyblok?
- [ ] ¿El bloque visual prescinde de JavaScript en el cliente o usa hidratación parcial mínima y justificada?
- [ ] ¿La jerarquía de encabezados (`<h2>`, `<h3>`, etc.) sigue un orden lógico?
- [ ] ¿El HTML de la sección es semántico y accesible?
- [ ] ¿La sección es totalmente responsiva y no genera desbordamiento horizontal (`overflow-x`) en móviles?
