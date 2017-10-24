//Cargamos el módulo express
var express = require('express');
var app = express()
var jwt = require('jwt-simple');
var swaggerJSDoc = require('swagger-jsdoc')
var https = require('https')

// swagger definition
var swaggerDefinition = {
    info: {
        title: 'API de UABay',
        version: '1.0.0',
        description: 'Demostración del funcionamiento de la API de UABay',
    },
    host: 'localhost:3000',
    basePath: '/',
};

// options for the swagger docs
var options = {
    // import swaggerDefinitions
    swaggerDefinition: swaggerDefinition,
    // path to the API docs
    apis: ['./app.js'],
};

// initialize swagger-jsdoc
var swaggerSpec = swaggerJSDoc(options);

const tokenSecret = "12345"

var bodyParser = require('body-parser');

app.use(bodyParser.json());

function existeNombreUsuario(nombreUsuario) {
    knex.where({
        nombre_usuario: nombreUsuario
    }).select().table('Usuario').then((usuarios) => {
        if (usuarios.length > 0) {
            return true
        } else {
            return false
        }
    })    
}

function checkAuth(pet, resp, next) {
    var token = pet.get('token');

    var decoded = jwt.decode(token, tokenSecret).nombreUsuario
    
    knex.where({
        nombre_usuario: decoded
    }).select().table('Usuario').then((usuarios) => {
        if (usuarios.length > 0) {
            next();
        } else {
            resp.status(401);
            resp.send("Debes autentificarte"); 
        }
    });
}

var knex = require('knex')({
    dialect: 'sqlite3',
    connection: {
      filename: './database'
    },
    pool: {
      afterCreate: function (conn, cb) {
        conn.run('PRAGMA foreign_keys = ON', cb)
      }
    },
    useNullAsDefault: true
  });

  //Documentación
  app.use('/', express.static('dist'));


/**
 * @swagger
 * /usuarios/{nombre_usuario}/articulos:
 *   get:
 *     tags:
 *       - Artículos
 *     description: Devuelve todos los artículos del usuario especificado
 *     parameters:
 *       - name: nombre_usuario
 *         description: Nombre de usuario
 *         in: path
 *         required: true
 *         type: string
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Un array de artículos
 *       404:
 *         description: El usuario especificado no existe
 */
app.get('/usuarios/:nombre_usuario/articulos', function(req,res) {
    var nombreUsuario = req.params.nombre_usuario
    var body = req.body
    
    var result = []
    knex.where({
        nombre_usuario: nombreUsuario
    }).select().table('Articulo').then((articulos) => {
        if (articulos.length < 1) {
            knex.where({
                nombre_usuario: nombreUsuario
            }).select().table('Usuario').then((usuarios) => {
                if (usuarios.length == 1) {
                    res.status(200)
                    res.send("No hay artículos para este usuario")
                } else {
                    res.status(404)
                    res.send({error: "El usuario no existe"})
                }
            })
        } else {
            articulos.forEach(function(articulo) {
                result.push({ID: articulo.ID, nombre: articulo.nombre, precio: articulo.precio, cantidad: articulo.cantidad, 
                    nombreUsuario: articulo.nombreUsuario})
            });
            res.status(200)
            res.setHeader('Content-Type', 'application/json');
            res.send(result)
        }
    })
});

/**
 * @swagger
 * /ebay?busqueda={busqueda}&limite={limite}:
 *   get:
 *     tags:
 *       - Ebay
 *     description: Busca el artículo especificado en "busqueda" en Ebay, devolviendo tantos artículos como "limite"
 *     parameters:
 *       - name: busqueda
 *         description: Nombre del artículo a buscar
 *         in: url
 *         required: true
 *         type: string
 *       - name: limite
 *         description: Número de resultados a devolver
 *         in: url
 *         required: true
 *         type: integer
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Consultar API Ebay
 */
app.get('/ebay', function(req,res) {
    var busqueda = req.query.busqueda
    var limite = req.query.limite
    
    const options = {
        hostname: 'api.ebay.com',
        port: 443,
        path: '/buy/browse/v1/item_summary/search?&q=' + busqueda + '&limit=' + limite,
        method: 'GET',
        headers: {
          'Authorization' : 'Bearer v^1.1#i^1#I^3#f^0#r^0#p^1#t^H4sIAAAAAAAAAOVXbWwURRjutb3yLWoIGGzCuWgkyO7N7N7ex9q75KBQqqU9uINKFcp+zLVL93bPnTnbI1hrAyQq/BASDURjLRpAMEAUE5QfSsRoghJ/KJrwwxAhlg9FiR+YiM5uj3KtBCpUJPH+XOadd955n+d93pkd0FUxZua6+et+neAZVdrTBbpKPR44Doyp8D5wW1npVG8JKHLw9HTd21XeXfZdFZYzRlZahHDWMjHydWQME0uuMcrkbFOyZKxjyZQzCEtElZLxBXUSzwEpa1vEUi2D8dVWR5mAIsNgGIKgoip8RJap1bwUM2VFmWBI42FEFGWoCXwoFKDzGOdQrYmJbJIowwMYYiFg+UAKAgmEJBjgApFAE+NbgmysWyZ14QATc9OV3LV2Ua5XT1XGGNmEBmFitfF5yYZ4bfXc+lSVvyhWrMBDksgkhweP5lga8i2RjRy6+jbY9ZaSOVVFGDP+WP8Og4NK8UvJXEf6LtUhESm8CGUtqEBNhSPC5DzLzsjk6mk4Fl1j066rhEyik/y1CKVkKCuRSgqjehqittrn/C3MyYae1pEdZebOji+NJxJMbGFOV606Q2cXx2fLeTaxqJoVRS0MNEHRWCoumQ+FxcIu/aEKFA/ZZo5larpDGPbVW2Q2oimjQcSAiCQWEUOdGswGO54mTjrFBPKXCAzDJqeg/RXMkVbTqSnKUBZ87vDa9A+sJsTWlRxBAxGGTrj8RBk5m9U1Zuikq8OCdDpwlGklJCv5/e3t7Vy7wFl2i58HAPofWVCXVFtRhjZiv6/T6x1Yv/YCVnehqIiuxLpE8lmaSwfVKU3AbGFivBgOCcEC74PTig21/s1QhNk/uBtGqjtUQeGVYFgUhBAICrw6Eu0RKyjU7+SBFCrNjGy3IZI1ZBWxKtVZLoNsXZMEMc0L4TRitWAkzQYi6TSriFqQhWmEAEKKokbC/5suGa7Ok6qVRQnL0NX8iKl9RJQu2FpCtkk+iQyDGoYr+SuCxA7ImwXP6fXhQXRiYBpEzuqcI2xOtTJ+S6YnmmNqdrO+Idw6vQhvqaJSgP1Ida3/CuNcuBx+QuVshK2cTS9vrsE51FNWGzJplxDbMgxkL4E3xMTIHuf/wVF+RVSqoVMam281ZP/kjLxOYcvkloBc3u1ZOAAbiiAcFiJBIXBD2Oa4RU3lb96JNbyqzrcwQdq/8OnhH/wIipW4P9jt2Qe6PXvpOwr4wX1wOrinomxxedn4qVgniNPlNIf1FpN+29uIa0P5rKzbpRWeRyv37Gguenb1LAN3DTy8xpTBcUWvMFB5ecYLJ06ZAEMQ8AEIQAgGmsD0y7PlcHL5pA3fP7R7W+MGbmwf8Sb9a/a+WDE6AiYMOHk83hKqh5KPL+C241PWnqvZ+tbv62vebtwy/dBTL63UzmnxTuPQJ2dWngo/vuvYpBPPrT29unlNhXn0g1GNq6Kp98++evr1FT++13b4xC+tq0vf2LzV7OMOb7v91MNVXx2cxfZt+OjOxb3TcGfLybm951Pjv86ebT+7e9LJY6kFM5bbG2cuS3/bd3F5dnRXbOrGiZkj7z5XU3/M25kYezG/6o7eDyv3P3bgeaT0hhI9f/w2vuni8fim+Z8L08681vnyM582ldR9sTP2zYppHfdvmlzN5C68+fNP4xpneffN2H1k5/4du14ILZ355dHOPc9KVaPUeE3D9qd7X4GbFObgO5Lns83M9uVb/lxx5vzdP4iV25+MrT/wYH/5/gIojRwPEA8AAA=='
        }
      };
      var data = ''
      const request = https.request(options, (apiResponse) => {
        res.status(200)
        res.contentType('application/json')
        
        apiResponse.on('data', chunk => data += chunk.toString());
        apiResponse.on('end', function () {
            res.send(data)
        });
      }).end()
      
      
});


app.get('/swagger.json', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
})

/**
 * @swagger
 * /usuarios/{nombre_usuario}/articulos:
 *   post:
 *     tags:
 *       - Artículos
 *     description: Crea un artículo para el usuario especificado
 *       - application/json
 *     parameters:
 *       - name: nombre_usuario
 *         description: Nombre de usuario
 *         in: path
 *         required: true
 *         type: string
 *       - name: nombre
 *         description: Nombre del artículo
 *         in: body
 *         required: true
 *         type: string
 *       - name: cantidad
 *         description: Cantidad de artículos
 *         in: body
 *         required: true
 *         type: integer
 *       - name: precio
 *         description: Precio de artículo
 *         in: body
 *         required: true
 *         type: float
 *       - name: token
 *         description: token para identificar al usuario
 *         in: header
 *         required: true
 *         type: string
 *       - name: token
 *         description: token para identificar al usuario
 *         in: header
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Un artículo.
 *       400:
 *         description: Faltan parámetros
 *       401:
 *         description: Debes autentificarte
 *       403:
 *         description: No tienes permiso para hacer eso
 */
app.post('/usuarios/:nombre_usuario/articulos', checkAuth, function(req, res) {
    var token = req.get("token")
    var decoded = jwt.decode(token, tokenSecret).nombreUsuario
    if (decoded != req.params.nombre_usuario) {
        res.status(403)
        res.send({error: "No tienes permiso para hacer eso"})
    } else {
        var params = req.body
        if (params.nombre && params.cantidad && params.precio) {
            knex('Articulo').insert(
                {nombre: params.nombre, precio: params.precio, cantidad: params.cantidad, 
                nombre_usuario: req.params.nombre_usuario}
            )
            .returning('ID')
            .then(function (ID) {
            res.status(201)
            res.setHeader('Content-Type', 'application/json');
            res.location('http://localhost:3000/usuarios/' + req.params.nombre_usuario + '/articulos/' + ID)
            res.send({ID: ID[0], nombre: params.nombre, precio: params.precio, cantidad: params.cantidad, 
                nombre_usuario: req.params.nombre_usuario})
            })
        }
        else {
            res.status(400)
            res.send({error: "faltan parámetros"})
        }
    }
});

/**
 * @swagger
 * /usuarios/{nombre_usuario}/articulos/{id}:
 *   post:
 *     tags:
 *       - Artículos
 *     description: Devuelve el artículo especificado
 *       - application/json
 *     parameters:
 *       - name: nombre_usuario
 *         description: Nombre de usuario
 *         in: path
 *         required: true
 *         type: string
 *       - name: id
 *         description: ID del artículo
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Un artículo.
 *       404:
 *         description: El artículo no existe
 */
app.get('/usuarios/:nombre_usuario/articulos/:id', function(req,res) {
    var nombreUsuario = req.params.nombre_usuario
    var id = req.params.id
    var body = req.body
    
    var result = []
    knex.where({
        nombre_usuario: nombreUsuario,
        ID: id
    }).select().table('Articulo').then((articulos) => {
        if (articulos.length < 1) {
            res.status(404)
            res.send({error: "El recurso especificado no existe"})
        } else {
            articulos.forEach(function(articulo) {
                res.status(200)
                res.setHeader('Content-Type', 'application/json');
                res.send({ID: articulo.ID, nombre: articulo.nombre, precio: articulo.precio, cantidad: articulo.cantidad, 
                    nombre_usuario: articulo.nombreUsuario})
            });
        }
    })
    
});

/**
 * @swagger
 * /usuarios/{nombre_usuario}/articulos/{id}:
 *   put:
 *     tags:
 *       - Artículos
 *     description: Actualiza el artículo especificado
 *       - application/json
 *     parameters:
 *       - name: nombre_usuario
 *         description: Nombre de usuario
 *         in: path
 *         required: true
 *         type: string
 *       - name: id
 *         description: ID del artículo
 *         in: path
 *         required: true
 *         type: integer
 *       - name: nombre
 *         description: Nombre del artículo
 *         in: body
 *         required: true
 *         type: string
 *       - name: cantidad
 *         description: Cantidad de artículos
 *         in: body
 *         required: true
 *         type: integer
 *       - name: precio
 *         description: Precio de artículo
 *         in: body
 *         required: true
 *         type: float
 *       - name: token
 *         description: token para identificar al usuario
 *         in: header
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Un artículo.
 *       404:
 *         description: El artículo no existe
 *       400:
 *         description: Faltan parámetros
 *       401:
 *         description: Debes autentificarte
 *       403:
 *         description: No tienes permiso para hacer eso
 *
 * @swagger
 * /usuarios/{nombre_usuario}/articulos/{id}:
 *   delete:
 *     tags:
 *       - Artículos
 *     description: Elimina el artículo especificado
 *       - application/json
 *     parameters:
 *       - name: nombre_usuario
 *         description: Nombre de usuario
 *         in: path
 *         required: true
 *         type: string
 *       - name: id
 *         description: ID del artículo
 *         in: path
 *         required: true
 *         type: integer
 *       - name: token
 *         description: token para identificar al usuario
 *         in: header
 *         required: true
 *         type: string
 *     responses:
 *       204:
 *         description: Artículo eliminado correctamente
 *       404:
 *         description: El artículo no existe
 *       401:
 *         description: Debes autentificarte
 *       403:
 *         description: No tienes permiso para hacer eso
 */
app.route('/usuarios/:nombre_usuario/articulos/:id')
.put(checkAuth, function(req,res) {
    var token = req.get("token")
    var nombreUsuario = req.params.nombre_usuario
    var decoded = jwt.decode(token, tokenSecret).nombreUsuario
    if (decoded != nombreUsuario) {
        res.status(403)
        res.send({error: "No tienes permiso para hacer eso"})
    } else {
        var params = req.body
        
        var id = req.params.id

        if (params.nombre && params.cantidad && params.precio) {
            knex('Articulo')
            .where({
                nombre_usuario: nombreUsuario,
                ID: id
            })
            .update({
                nombre: params.nombre, 
                precio: params.precio, 
                cantidad: params.cantidad
            })
            .returning('ID')
            .then(function (ID) {
                if (ID == 0) {
                    res.status(404)
                    res.send({error: "El recurso especificado no existe"})
                } else {
                    res.status(201)
                    res.setHeader('Content-Type', 'application/json');
                    res.location('http://localhost:3000/usuarios/' + req.params.nombre_usuario + '/articulos/' + id)
                    res.send({ID: id, nombre: params.nombre, precio: params.precio, cantidad: params.cantidad, 
                        nombre_usuario: req.params.nombre_usuario})
                }
            })
        }
        else {
            res.status(400)
            res.send({error: "faltan parámetros"})
        }
    }
})
.delete(checkAuth,function(req,res) {
    var token = req.get("token")
    var nombreUsuario = req.params.nombre_usuario
    var decoded = jwt.decode(token, tokenSecret).nombreUsuario
    if (decoded != nombreUsuario) {
        res.status(403)
        res.send({error: "No tienes permiso para hacer eso"})
    } else {
        var id = req.params.id

        knex('Articulo')
        .where({
            nombre_usuario: nombreUsuario,
            ID: id
        })
        .del()
        .returning('ID')
        .then(function (ID) {
        if (ID == 0) {
            res.status(404)
            res.send({error: "El recurso especificado no existe"})
        } else {
            res.status(204)
            res.send("Recurso eliminado correctamente")
        }
        })
    }
});

/**
 * @swagger
 * /usuarios/:nombre_usuario/favoritos:
 *   get:
 *     tags:
 *       - usuarios
 *     description: Devuelve todos los usuarios favoritos del usuario especificado 
 *       - application/json
 *     parameters:
 *       - name: nombre_usuario
 *         description: Nombre de usuario
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Un array, que en cada posición tiene el usuario que tiene un favorito y su favorito.
 *       404:
 *         description: El usuario no existe
 **/
app.get('/usuarios/:nombre_usuario/favoritos', function(req,res) {
    var nombreUsuario = req.params.nombre_usuario
    var body = req.body
    
    var result = []
    knex.where({
        usuario_tiene_favorito: nombreUsuario
    }).select().table('Favorito').then((usuarios) => {
        if (usuarios.length < 1) {
            res.status(404)
            res.send({error: "El recurso especificado no existe"})
        } else {
            usuarios.forEach(function(usuario) {
                result.push({usuario_tiene_favorito: usuario.usuario_tiene_favorito, 
                    usuario_es_favorito: usuario.usuario_es_favorito})
            });
            res.status(200)
            res.setHeader('Content-Type', 'application/json');
            res.send(result)
        }
    })
});

/**
 * @swagger
 * /usuarios/:nombre_usuario/favoritos:
 *   post:
 *     tags:
 *       - usuarios
 *     description: Crea un usuario favorito para el usuario especificado
 *       - application/json
 *     parameters:
 *       - name: nombre_usuario
 *         description: Nombre de usuario que quiere agregar un favorito
 *         in: path
 *         required: true
 *         type: string
 *       - name: favorito
 *         description: Nombre de usuario a agregar a favoritos
 *         in: body
 *         required: true
 *         type: string
 *       - name: token
 *         description: token para identificar al usuario
 *         in: header
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Un array, que en cada posición tiene el usuario que tiene un favorito y su favorito.
 *       404:
 *         description: El usuario no existe
 *       400:
 *         description: Faltan parámetros
 *       401:
 *         description: Debes autentificarte
 *       403:
 *         description: No tienes permiso para hacer eso
 **/
app.post('/usuarios/:nombre_usuario/favoritos', checkAuth, function(req,res) {
    var token = req.get("token")
    var decoded = jwt.decode(token, tokenSecret).nombreUsuario
    if (decoded != req.params.nombre_usuario) {
        res.status(403)
        res.send({error: "No tienes permiso para hacer eso"})
    } else {
        var params = req.body
        if (params.favorito) {
            knex.where({
                nombre_usuario: params.favorito
            }).select().table('Usuario').then((usuarios) => {
                if (usuarios.length > 0) {
                    knex('Favorito').insert(
                        {
                            usuario_tiene_favorito: req.params.nombre_usuario, 
                            usuario_es_favorito: params.favorito
                        }
                    ).then( function() {
                        res.send({
                            usuario_tiene_favorito: req.params.nombre_usuario, 
                            usuario_es_favorito: params.favorito
                        })
                    });
                } else {
                    res.status(404)
                    res.send({error: "Ese usuario no existe"})
                }
            })
        }
        else {
            res.status(400)
            res.send({error: "faltan parámetros"})
        }
    }
});

//Este método delega en el server.listen "nativo" de Node
app.listen(process.env.PORT || 3000, function () {
    console.log("Servidor arrancado") 
});


/**
 * @swagger
 * /login:
 *   post:
 *     tags:
 *       - login
 *     description: Devuelve el token para poder realizar acciones que lo requiren
 *       - application/json
 *     parameters:
 *       - name: nombre_usuario
 *         description: Nombre de usuario a loguear
 *         in: body
 *         required: true
 *         type: string
 *       - name: password
 *         description: Contraseña del respectivo usuario
 *         in: body
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Token para iniciar sesión.
 *       401:
 *         description: Contraseña incorrecta o Usuario inexistente
 *       400:
 *         description: Faltan parámetros
 **/
app.post('/login', function(req, res) {
    var params = req.body
    var nombreUsuario = params.nombre_usuario
    var password = params.pass

    if (nombreUsuario && password) {
        knex.where({
            nombre_usuario: nombreUsuario
        }).select().table('Usuario').then((usuarios) => {
            if (usuarios.length > 0) {
                if (usuarios[0].pass == password) {
                    var token = jwt.encode({nombreUsuario: nombreUsuario}, tokenSecret);
                    res.status(200)
                    res.setHeader('Content-Type', 'application/json');
                    res.send({token : token})
                } else {
                    res.status(401)
                    res.send({error: "Contraseña incorrecta"})
                }
            } else {
                res.status(401)
                res.send({error: "Ese usuario no existe"})
            }
        })   
    } else {
        res.status(400)
        res.send({error: "faltan parámetros"})
    }
});
