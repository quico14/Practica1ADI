# Practica1ADI

Done by Quico Llinares Llorens.

### Link Heroku's API 

[Heroku's API](https://blooming-tundra-62951.herokuapp.com/)

### Run seeders
run from terminal in the project's root `knex seed:run`
With the seeders we will have the following in the DB.
## Usuarios (users) Table
|nombre_usuario|nombre|apellidos|password|
|--|--|--|--|
|username_prueba| Nombre prueba | Apellidos prueba | 1 |
|username_prueba2| Nombre prueba2 | Apellidos prueba2 | 12 |
|username_prueba3| Nombre prueba3 | Apellidos prueba3 | 123 |
|username_prueba4| Nombre prueba4 | Apellidos prueba4 | 1234 |

## Articulos (articles) Table
|nombre|precio|cantidad|nombre_usuario|
|--|--|--|--|
|articulo prueba| 1,50 | 1 | 1 |
|Samsung Galaxy S8| 600,64 | 25 | username_prueba |
|articulo prueba2| 2,50 | 2 | username_prueba2 |
|articulo prueba3| 3,50 | 3 | username_prueba3 |

## Favoritos (favourites) Table
|usuario_tiene_favorito|usuario_es_favorito|
|--|--|
|username_prueba| username_prueba3 |
|username_prueba| username_prueba2 |
|username_prueba2| username_prueba |


### Run locally
- Download repository.
- Execute `npm install`.
- Execute `node app.js`
- Access from the browser to `localhost:3000`

### Run tests
Run from the terminal in project's root `./node_modules/.bin/mocha`
In the `init` of tests seeders are run.

All endpoints are defined in the API `documentation`, available in the base path of the API.

### Documentation
Documentation from use cases, tables relationship and satisfied use cases can be found in the file `Diseño API.pdf`
