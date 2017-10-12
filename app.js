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
          'Authorization' : 'Bearer v^1.1#i^1#p^1#f^0#I^3#r^0#t^H4sIAAAAAAAAAOVXe2wURRjv9aUV6wNRmwbisdWAxd2b3b3H3oY7PVpIT4EW7lq0hNR9zLZL93YvO3O051+liUXFBEuIDzSAKDFoUGooKAkkGBSFkKgBBA0YYyQ+QwgaMQR0du8o10qgQkUS75/LfPPNN9/v9/2+mR3QU15R29fQ93ul54bidT2gp9jjYceBivKyabeUFFeXFYECB8+6nnt7SntLvp+OpJSRFudDlLZMBL3dKcNEomuMUBnbFC0J6Ug0pRREIlbERGzObJFjgJi2LWwplkF54/URCrKcDICmcazCs1AIEat5PmbSilB+VfYD2R8OQA2GZS5A5hHKwLiJsGTiCMUBNkSzgGa5JMeKPCtygAEhfyvlbYE20i2TuDCAirrpiu5auyDXS6cqIQRtTIJQ0XhsVqIxFq+fOTc53VcQK5rnIYElnEHDR3WWCr0tkpGBl94Gud5iIqMoECHKF83tMDyoGDufzBWk71KtgZDCc0ALhXggCWF2TKicZdkpCV86D8eiq7TmuorQxDrOXo5Rwoa8GCo4P5pLQsTrvc7fvIxk6JoO7Qg1c0bssVhTExWdl9EVa7ah082xGVKWbppfTwcCqgBUXlZpgQUSFxIC+V1yofIcj9imzjJV3WEMeedaeAYkKcORxHAFxBCnRrPRjmnYSafQjz9PYJBrdSqaK2EGd5hOUWGKsOB1h5enf2g1xrYuZzAcijBywuUnQknptK5SIyddIea1040iVAfGadHn6+rqYrp4xrLbfRwArO/RObMTSgdMSVTO1+l14q9ffgGtu1AUSFYiXcTZNMmlmwiVJGC2U1EuIIT4YJ734WlFR1r/ZijA7BveDmPVHmEoA5UTVMUvaBIblMeiPaJ5hfqcPKBMpJmS7E6I04akQFohOsukoK2rIh/QOF7QIK0GwxrtD2saLQfUIM1qEAIIZVkJC/+bLhmtzhOKlYZNlqEr2bFS+9gonbfVJsnG2QQ0DGIYreQvChI5IK8RPKfXRwnRiYFIECmtM46wGcVK+SyJnGiOqc3N+qpw6+QmvK6KSgDmkOpq7gpjXLgMWqIwNkRWxia3N9PoHOpJqxOapEuwbRkGtFvYq2JiTI/z/+IovygqxdAJjW3XG7J/ckZeobAlfD1ALu31zL8Amw2AkODnBQFcFbY6t6jJ7DU7sUZZ1QYLYaj+C58evuGvoGiR+2N7PYOg1zNAHlLAB+5ja8Dk8pLm0pKbq5GOIaNLGoP0dpN83NuQ6YTZtKTbxeWehRM3b2wreHetWwSqhl5eFSXsuIJnGJh4YaaMvfXuSjbEApbjWJ7lQCuouTBbyt5VOmF3eOPCHUs/j312oLvi0+PNU/Yf/WAJqBxy8njKioggiraFFf93Z54MrF/TsJ2uOXXb+8apvRsGqjfdeW5nA1j5w9mB27faC1fcE2/9eTC1vn/R178m333l29pndvb51h55bc65WurpbbtfVvutpXtO1300/o6OVU/UTT54yJou/Dn1oVNt9z9eVdvL/PbW2u6fql/8smXxj8WTjreUnoi/QZevtr7ZcmLw3Bn+wQPLb3xzQDz4Trj9veSe1N4jO5KrNx1rrFqZWX44OGlBZ/VLh3ecFChp6t7Tm1//8NmmfYd2LStv7l1To9ZP2Gf/0n/T818ly/ZXba1HfatXPLdhyvHKk+MqP9716va3p43/ZOoysOCFYxO27/siNO0sP9j31NEtx/Yc+ONMxHz4kSDwPDA5V76/APVdwD8RDwAA'
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
                    res.location('http://localhost:3000/usuarios/' + req.params.nombre_usuario + '/articulos/' + ID)
                    res.send({ID: ID[0], nombre: params.nombre, precio: params.precio, cantidad: params.cantidad, 
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
