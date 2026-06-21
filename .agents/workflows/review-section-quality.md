# Workflow: Review Section Quality

Este flujo de trabajo se utiliza para auditar el rendimiento, la accesibilidad y el SEO de un componente o sección ya existente en el proyecto.

## Pasos del Flujo de Trabajo

### Paso 1: Auditoría de Schema
1. Comprueba que el archivo de schema JSON en `/storyblok/components/schemas/` cumple con la sintaxis requerida.
2. Verifica que las claves de campos y el componente están en `snake_case`.
3. Revisa la propiedad `translatable` en todos los campos: textos para el editor traducibles, campos técnicos no traducibles.

### Paso 2: Auditoría del Componente Astro
1. Revisa el código del componente Astro en `/src/components/storyblok/`.
2. Inspecciona el frontmatter para certificar que el tipado de TypeScript y la deconstrucción de props son limpios.
3. Evalúa si se están declarando scripts en el cliente o importando librerías innecesarias que comprometan la métrica INP.

### Paso 3: Auditoría de Imágenes
1. Localiza todas las etiquetas `<img>` o componentes de imagen.
2. Confirma el uso de `<StoryblokImage />` para todas las imágenes dinámicas.
3. Comprueba el valor de `loading` (eager para LCP, lazy por defecto).
4. Verifica que existan propiedades de tamaño (`width`, `height` o ratio) para blindar el layout frente a CLS.
5. Comprueba los anchos responsivos (`widths`) y los descriptores (`sizes`).
6. Valida que el texto alternativo (`alt`) cumpla con las pautas de accesibilidad y no sea redundante.

### Paso 4: Auditoría de SEO y Semántica
1. Inspecciona el orden de los encabezados (jerarquía semántica de H2, H3).
2. Valida que no se dupliquen etiquetas `<h1>`.
3. Asegura el uso de elementos semánticos de marcado.
4. Confirma que no se hardcodean textos localmente en el componente para que la traducción sea 100% editable desde el CMS.

### Paso 5: Generación del Informe de Calidad
Genera un reporte detallando los resultados estructurados bajo las siguientes secciones:

1.  **Correcto**: Puntos fuertes y buenas prácticas bien implementadas en el componente.
2.  **Mejorable**: Cambios recomendados que no impiden el funcionamiento pero mejoran la optimización general, legibilidad o estructuración.
3.  **Crítico**: Errores que rompen la validación, degradan considerablemente las métricas Core Web Vitals (ej. LCP perezoso, CLS severo), rompen la traducción multilingüe o comprometen la accesibilidad.
4.  **Acciones Recomendadas**: Lista ordenada de tareas a realizar para corregir los puntos detectados.
