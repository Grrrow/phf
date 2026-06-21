# Work Highlight Card

## Descripción General
Este bloque representa una composición, proyecto o grabación específica. Solo debe usarse anidado dentro de la lista `items` de una `Featured Works Section`.

## Configuración y Contenido
### Categorías Libres
El campo `category` es libre e intencionadamente un campo de texto abierto para permitir denominaciones editoriales precisas como "Symphonic Suite", "Opera", "Chamber", o "Latest Release". Se mostrará en la cabecera de la tarjeta.

### Tipos de Media (`media_type`)
Selecciona qué tipo de media principal acompaña al texto:
- `none`: Solo texto.
- `image`: Muestra la imagen cargada.
- `audio` / `video`: Muestra la imagen con una superposición sutil del icono "Play". De momento esto actuará de forma visual; al hacer click se enviará al usuario al enlace definido en `cta_link`.
- `release`: Tratará la imagen cargada con proporción 1:1 (cuadrada), ideal para portadas de discos.

### Tamaño en el Grid (`card_size`)
Es vital para configurar el estilo asimétrico:
- **Large**: Ocupa dos columnas. Ideal para la tarjeta principal (ej. la obra más destacada). Requiere una imagen de alta calidad apaisada (proporción 16:9 recomendada).
- **Medium**: Ocupa una columna.
- **Small**: Más compacta, ideal para obras adicionales solo con texto o portada muy pequeña.

### Estilo Visual (`card_style`)
- **Media Feature**: Estilo por defecto, con bloque de medios arriba y textos abajo.
- **Text Card**: Ignora los archivos multimedia y muestra una tarjeta limpia con fondo blanco.
- **Release Card**: Adapta la tarjeta visualmente para lanzamientos de álbumes.

### Imágenes y Optimización
Las imágenes servidas a través de este bloque se optimizan automáticamente y de forma nativa a través del **Storyblok Image Service** en varios tamaños responsivos (dependiendo del campo `card_size` que elijas). 
- Usa imágenes de al menos 1440px de ancho si usas el tamaño `large`.
- Rellena `image_alt` con una descripción si la imagen aporta valor de contenido. Activa `image_is_decorative` si solo sirve de fondo estético.

### Campos Traducibles
- `category`, `title`, `description`, `image_alt`, `duration_label`, `cta_label`.

## Lo que debes evitar
- No insertes este bloque fuera de una `Featured Works Section`.
- No satures el título o la descripción con demasiado texto; mantén una línea editorial concisa.
- Si usas `media_type` "Audio" o "Video", recuerda que el reproductor avanzado no está embebido aquí por rendimiento. Introduce un `cta_link` hacia la obra o plataforma de streaming para que el usuario la escuche al hacer clic en la tarjeta.
