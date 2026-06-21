# Works Catalog Group

## Descripción General
Este bloque sirve para agrupar un listado de obras bajo una misma categoría (ej. "Operas", "Symphonic", "Chamber Music").

## Layout
En pantallas grandes, el grupo dividirá la pantalla en dos columnas:
1. **Izquierda**: El título del grupo de forma pegajosa ("sticky") junto con su descripción.
2. **Derecha**: La larga lista de obras (`work_catalog_item`).

## Uso de Categorías
- **Title**: El nombre de la categoría. Se mostrará como un H2 en la página. (Traducible).
- **Description**: (Opcional). Texto de apoyo si la categoría lo requiere.
- **Anchor ID**: Te permite crear un enlace directo a este grupo desde el menú u otro botón. Por ejemplo, si pones `operas`, la URL `/works/#operas` hará scroll automáticamente hasta aquí.

## Orden de las Obras
Las obras que añadas dentro del campo `items` se renderizarán exactamente en el mismo orden en el que las coloques aquí dentro del editor de Storyblok (puedes arrastrarlas para reordenar).
