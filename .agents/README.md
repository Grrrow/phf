# Antigravity Agent Configuration for Astro + Storyblok

Este directorio contiene la configuración de **Agent Skills**, **Agentes Especializados** y **Workflows** para estructurar la automatización del proyecto mediante el IDE Google Antigravity.

---

## 1. Agentes Especializados

Hemos estructurado cinco perfiles de agentes que actúan como "guardianes de calidad" durante el desarrollo de la web:

### [storyblok-architect](./agents/storyblok-architect.md)
*   **Propósito**: Modelar esquemas locales de Storyblok, estructurar componentes y documentarlos.
*   **Skills que usa**: `storyblok-block-generator`, `storyblok-schema-validator`, `astro-storyblok-renderer`, `storyblok-global-config-architect`.
*   **Enfoque**: Consistencia de schemas, traducción correcta, Root vs Nestable, documentación y validación local de componentes.

### [astro-performance-reviewer](./agents/astro-performance-reviewer.md)
*   **Propósito**: Garantizar la optimización del código Astro y proteger Core Web Vitals (LCP, CLS, INP).
*   **Skills que usa**: `astro-performance-guardian`, `storyblok-image-optimization-guardian`.
*   **Enfoque**: Minimizar scripts en cliente, previsualizar CLS, estructurar LCP eager con alta prioridad y asegurar responsive móvil.

### [storyblok-image-guardian](./agents/storyblok-image-guardian.md)
*   **Propósito**: Asegurar el correcto uso del Storyblok Image Service para servir imágenes de forma optimizada.
*   **Skills que usa**: `storyblok-image-optimization-guardian`, `astro-performance-guardian`.
*   **Enfoque**: Forzar el uso de `<StoryblokImage />` con dimensiones explícitas, crops inteligentes, alts y anchos/sizes responsivos.

### [seo-i18n-guardian](./agents/seo-i18n-guardian.md)
*   **Propósito**: Validar SEO técnico e internacionalización bilingüe (ES/EN) sin diccionarios locales.
*   **Skills que usa**: `storyblok-global-config-architect`, `storyblok-schema-validator`, `astro-performance-guardian`.
*   **Enfoque**: Alternados hreflang, canonicals dinámicos, Open Graph, H1 único, cascada de fallback del SEO global y estructuración JSON-LD.

### [frontend-qa-reviewer](./agents/frontend-qa-reviewer.md)
*   **Propósito**: Dar la aprobación de calidad final mediante pruebas de build e integración antes del push al CMS.
*   **Skills que usa**: Todas las skills relevantes (`storyblok-schema-validator`, `astro-performance-guardian`, etc.).
*   **Enfoque**: Pruebas `npm run build`, cumplimiento integral de a11y, responsive completo y documentación.

---

## 2. Workflows Disponibles

Para sistematizar el desarrollo, debes invocar los siguientes flujos de trabajo según corresponda:

### A. [create-storyblok-section](./workflows/create-storyblok-section.md)
*   **Cuándo usar**: Cada vez que se desarrolle una nueva sección visual (ej. componentes de la Home).
*   **Fases clave**: Diseño de Schema -> Creación de Componente Astro -> Optimización de Imágenes -> Análisis de Rendimiento -> Revisión SEO -> QA final y validación local.

### B. [review-section-quality](./workflows/review-section-quality.md)
*   **Cuándo usar**: Para auditar un componente o sección ya existente.
*   **Resultado**: Informe detallado con clasificación de hallazgos en *Correcto*, *Mejorable*, *Crítico* y *Acciones Recomendadas*.

---

## 3. Skills de Soporte

Las skills individuales se definen bajo [.agents/skills/](./skills/):
1.  **[astro-performance-guardian](./skills/astro-performance-guardian/SKILL.md)**: Reglas de rendimiento web.
2.  **[storyblok-image-optimization-guardian](./skills/storyblok-image-optimization-guardian/SKILL.md)**: Manipulación de assets con el servicio de imágenes.
3.  **[storyblok-block-generator](./skills/storyblok-block-generator/SKILL.md)**: Plantillas para bloques y componentes.
4.  **[storyblok-schema-validator](./skills/storyblok-schema-validator/SKILL.md)**: Comprobaciones locales antes del push.
5.  **[storyblok-component-mapper](./skills/storyblok-component-mapper/SKILL.md)**: Registro automatizado en Astro.
6.  **[astro-storyblok-renderer](./skills/astro-storyblok-renderer/SKILL.md)**: fetching dinámico e i18n de rutas.
7.  **[storyblok-global-config-architect](./skills/storyblok-global-config-architect/SKILL.md)**: Configuración global transversal del layout.

---

## 4. Cómo Invocar a los Agentes y Workflows

Puedes pedirle directamente al agente de Antigravity en el chat que adopte un perfil o ejecute un flujo de trabajo.

*   **Para crear una sección**:
    > *"Inicia el workflow create-storyblok-section para crear el bloque de Eventos de la Home."*
*   **Para revisar un componente existente**:
    > *"Ejecuta el workflow review-section-quality sobre el componente HeroSection.astro."*
*   **Para invocar un perfil específico**:
    > *"Actúa como astro-performance-reviewer y revisa si este componente causa problemas de CLS."*
    > *"Actúa como storyblok-image-guardian para añadir el srcset responsivo a esta imagen."*
