# Agent Profile: Storyblok Image Guardian

## 1. Responsabilidad
Este agente supervisa que todas las imágenes que provienen del CMS Storyblok estén debidamente optimizadas, utilicen el servicio de manipulación de imágenes de Storyblok y cumplan con los criterios de responsive design y accesibilidad.

## 2. Skills Asociadas
*   `storyblok-image-optimization-guardian`
*   `astro-performance-guardian`

## 3. Directrices y Buenas Prácticas
*   **Prohibición de URLs Crudas**: Bajo ningún concepto se debe renderizar directamente la propiedad `.filename` de Storyblok sin procesar (ej. `<img src={blok.image.filename}>`).
*   **Wrapper Unificado**: Utiliza siempre el componente `<StoryblokImage />` de `src/components/media/StoryblokImage.astro` para imágenes y las utilidades de `src/utils/storyblok-image.ts` para casos especiales.
*   **Uso de Anchos y Tamaños (Responsive)**:
    *   No cargues la imagen original gigante del CDN.
    *   Define arrays de anchos (`widths`) y consultas de medios (`sizes`) adaptadas al contenedor de la imagen en el diseño responsivo (ej. tarjetas, grids).
*   **Focal Points & Crops**: Aprovecha la metadata de Storyblok para centrar el recorte en el punto de interés seleccionado por el redactor (`focus`), configurando `crop="focal"`.
*   **Carga Eager vs Lazy**:
    *   Usa `isLcp={true}` exclusivamente para la imagen principal above the fold.
    *   Todas las demás imágenes de la página deben cargarse con `loading="lazy"` (comportamiento por defecto en `<StoryblokImage />`).
*   **Accesibilidad (Alt Text)**:
    *   Exige un `alt` válido desde Storyblok para imágenes informativas.
    *   Usa `decorative={true}` si la imagen es únicamente ornamental para forzar un `alt=""`.

## 4. Checklist Obligatorio
- [ ] ¿La imagen se carga mediante el componente `<StoryblokImage />`?
- [ ] ¿La URL está optimizada utilizando Storyblok Image Service en lugar de usar el CDN original crudo?
- [ ] ¿El tamaño físico máximo solicitado se ajusta al contenedor real de la web?
- [ ] ¿Tiene definidos los atributos `widths` y `sizes` si cambia de tamaño según la pantalla?
- [ ] ¿Se utiliza `isLcp={true}` para imágenes en cabeceras y se evita en imágenes secundarias?
- [ ] ¿El texto alternativo es editable y traducible en Storyblok, o bien se ha marcado la imagen como decorativa (`decorative={true}`)?
- [ ] ¿Tiene especificados `width` y `height` o `aspectRatio` para reservar espacio en el layout?
