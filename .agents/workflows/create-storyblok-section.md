# Workflow: Create Storyblok Section

Este flujo de trabajo debe seguirse obligatoriamente cada vez que se cree una nueva sección visual de la página (ej. componentes para la Home o subpáginas).

## Pasos del Flujo de Trabajo

### Paso 1: Diseño y Modelado (Invocar a `storyblok-architect`)
1. Determina si la sección requiere un nuevo bloque de Storyblok o si se puede reutilizar o extender un componente existente en el proyecto.
2. Define los campos necesarios (por ejemplo, títulos, textos, imágenes, enlaces).
3. Diseña el schema local en `/storyblok/components/schemas/[nombre_del_bloque].json` respetando que los campos visibles para el usuario sean `"translatable": true` y los campos técnicos no sean traducibles.
4. Genera la documentación técnica de uso para el panel del editor.

### Paso 2: Desarrollo del Componente Astro
1. Crea el componente en `/src/components/storyblok/[NombreDelBloque].astro` en base al schema definido.
2. Registra el componente alfabéticamente en `src/storyblok/components.ts` para habilitar el mapeo dinámico de Storyblok.

### Paso 3: Optimización de Imágenes (Invocar a `storyblok-image-guardian`)
1. Si la sección contiene imágenes administradas por el CMS:
   - Utiliza exclusivamente el componente `<StoryblokImage />`.
   - Si la imagen es el elemento principal visual above the fold, configúrala con `isLcp={true}`.
   - Si la imagen es secundaria o está below the fold, asegúrate de que use lazy loading y decoding asíncrono (comportamiento por defecto).
   - Configura las propiedades responsivas (`widths` y `sizes`) acordes a las dimensiones de visualización en el diseño.
   - Suministra un `alt` válido o marca como `decorative={true}` si es puramente ornamental.

### Paso 4: Revisión de Rendimiento (Invocar a `astro-performance-reviewer`)
1. Verifica que el componente Astro sea estático por defecto.
2. Comprueba que no se envíe JavaScript innecesario al cliente. Si se requiere interactividad, utiliza hidratación parcial (`client:visible` o `client:idle`).
3. Comprueba que se reserven las dimensiones espaciales de los elementos para asegurar CLS cero.

### Paso 5: Revisión de SEO e i18n (Invocar a `seo-i18n-guardian`)
1. Asegura que la jerarquía de headings de la sección sea semántica (ej. no colocar un `<h1>` secundario ni saltar niveles).
2. Valida que todo el contenido textual visible provenga de propiedades dinámicas de Storyblok traducibles, sin hardcodear textos locales.

### Paso 6: Control de Calidad y Validación (Invocar a `frontend-qa-reviewer`)
1. Ejecuta la validación de schemas de Storyblok:
   ```bash
   npm run storyblok:validate
   ```
2. Ejecuta una compilación de prueba en local para descartar problemas de TypeScript:
   ```bash
   npm run build
   ```
3. Verifica que la sección sea fluida y responsive en móviles.

### Paso 7: Sincronización (Solo bajo aprobación)
1. Presenta los resultados y la documentación del nuevo bloque al usuario.
2. **No realices push a Storyblok (`npm run storyblok:push`) sin la autorización explícita y por escrito del usuario.**
