# Practica1ADI

Realizada por Quico Llinares Llorens.

### Enlace API en Heroku

[API en Heroku](https://blooming-tundra-62951.herokuapp.com/)

### Correr seeders
Ejecutar desde la terminal en la raíz del proyecto `knex seed:run`
Con los seeders tendremos lo siguiente en la base de datos:
## Tabla Usuarios
|nombre_usuario|nombre|apellidos|password|
|--|--|--|--|
|username_prueba| Nombre prueba | Apellidos prueba | 1 |
|username_prueba2| Nombre prueba2 | Apellidos prueba2 | 12 |
|username_prueba3| Nombre prueba3 | Apellidos prueba3 | 123 |
|username_prueba4| Nombre prueba4 | Apellidos prueba4 | 1234 |

## Tabla Articulos
|nombre|precio|cantidad|nombre_usuario|
|--|--|--|--|
|articulo prueba| 1,50 | 1 | 1 |
|Samsung Galaxy S8| 600,64 | 25 | username_prueba |
|articulo prueba2| 2,50 | 2 | username_prueba2 |
|articulo prueba3| 3,50 | 3 | username_prueba3 |

## Tabla Favoritos
|usuario_tiene_favorito|usuario_es_favorito|
|--|--|
|username_prueba| username_prueba3 |
|username_prueba| username_prueba2 |
|username_prueba2| username_prueba |


### Correr en local
- Descargar repositorio.
- Ejecutar `npm install`.
- Ejecutar `node app.js`
- Acceder desde el navegador a `localhost:3000`

### Correr tests
Ejecutar desde la terminal en la raíz del proyecto `./node_modules/.bin/mocha`
Al inicio de los tests se corre el seeder.

Todos los endpoints están definidos en la `documentación` del API, la cual se encuentra en la ruta base del API.

La documentación de los casos de uso, relaciones entre tablas, y casos de uso que se satisfacen se puede encontrar en el archivo `Diseño API.pdf`
