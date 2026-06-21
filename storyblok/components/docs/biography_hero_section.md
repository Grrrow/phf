# Biography Hero Section

## Descripción General
El bloque de presentación que suele encabezar la biografía. Tiene un diseño dividido en dos columnas: el texto a un lado y la fotografía enmarcada al otro.

## Lógica y Configuración
- **Textos**: El título suele ser muy grande, como "A Life in Movement". Soporta un pequeño texto superior (`eyebrow`) y un párrafo introductorio. Todos son traducibles.
- **Imagen**: Se espera un retrato. Por defecto, aplicará un filtro blanco y negro (`image_treatment: black_white`) para mantener la elegancia.
- **Image Position**: Puedes decidir si en pantallas grandes la imagen va a la derecha (por defecto) o a la izquierda.
- **IS LCP (Importante para SEO)**: Si este hero es el primer bloque de la página (lo normal), DEBES dejar activada la opción `is_lcp`. Esto le dice al navegador que descargue la imagen inmediatamente, mejorando la puntuación SEO de Google Core Web Vitals. Si, por algún motivo, usas este bloque en mitad de la página y no se ve al abrirla, desmárcalo.
- **Heading Level**: Normalmente será `h1` porque es el título principal de la página de biografía.
