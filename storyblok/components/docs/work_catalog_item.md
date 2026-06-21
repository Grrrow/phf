# Work Catalog Item

## Descripción General
Este bloque representa una sola obra dentro de una categoría del catálogo. Visualmente se plasma como una fila elegante con título, descripción menor, año y botón de detalles.

## Campos de Texto y Traducción
- **Title**: El título principal de la obra (traducible).
- **Description**: Texto secundario (traducible). Úsalo para indicar orquestaciones (ej. *para piano y cuerdas*), duración, o notas breves. No abuses de su longitud para no romper el diseño minimalista de fila.
- **Year Label**: Es texto libre, no un campo de fecha estricto. Esto te permite ser muy específico editorialmente (ej. "2022", "1998-2005", "rev. 2024", "in progress").
- **Details Label**: El texto del enlace (ej. "View Details", "Más información").

## Enlaces
- **Details Link**: Especifica hacia dónde debe ir el usuario al clicar la obra. Puede ser una página interna de proyecto/disco, o un enlace externo. Si es un enlace externo a otra plataforma, considera activar la opción `open_in_new_tab`.

## Ordenación Interna (`sort_year`)
El campo `sort_year` es un campo puramente numérico y **no se mostrará** de cara al usuario. Está ahí de manera previsora por si, en un futuro, el desarrollo necesita ordenar cronológicamente las obras usando código en vez del orden visual del editor. No es obligatorio llenarlo para el diseño actual.
