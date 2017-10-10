//Cargamos el módulo express
var express = require('express');
var app = express()
var jwt = require('jwt-simple');
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

app.get('/usuarios/:nombre_usuario/articulos', function(req,res) {
    var nombreUsuario = req.params.nombre_usuario
    var body = req.body
    
    var result = []
    knex.where({
        nombre_usuario: nombreUsuario
    }).select().table('Articulo').then((articulos) => {
        articulos.forEach(function(articulo) {
            result.push({ID: articulo.ID, nombre: articulo.nombre, precio: articulo.precio, cantidad: articulo.cantidad, 
                nombreUsuario: articulo.nombreUsuario})
        });
        res.status(200)
        res.send(result)
    })
});

app.post('/usuarios/:nombre_usuario/articulos', checkAuth, function(req, res) {
    var params = req.body
    if (params.nombre && params.cantidad && params.precio) {
        knex('Articulo').insert(
            {nombre: params.nombre, precio: params.precio, cantidad: params.cantidad, 
            nombre_usuario: req.params.nombre_usuario}
        )
        .returning('ID')
        .then(function (ID) {
        res.status(201)
        res.location('http://localhost:3000/usuarios/' + req.params.nombre_usuario + '/articulos/' + ID)
        res.send({ID: ID[0], nombre: params.nombre, precio: params.precio, cantidad: params.cantidad, 
            nombre_usuario: req.params.nombre_usuario})
        })
    }
    else {
        res.status(400)
        res.send({error: "faltan parámetros"})
    }
});

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
                res.send({ID: articulo.ID, nombre: articulo.nombre, precio: articulo.precio, cantidad: articulo.cantidad, 
                    nombre_usuario: articulo.nombreUsuario})
            });
        }
    })
    
});

app.route('/usuarios/:nombre_usuario/articulos/:id')
.put(checkAuth, function(req,res) {
    var params = req.body
    var nombreUsuario = req.params.nombre_usuario
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
})
.delete(checkAuth,function(req,res) {
    var nombreUsuario = req.params.nombre_usuario
    var id = req.params.id


    //Imposible tener error 400???!!
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

});

app.route('/usuarios/:nombre_usuario/favoritos')
.get(function(req,res) {
    var nombreUsuario = req.params.nombre_usuario
    var body = req.body
    
    var result = []
    knex.where({
        usuario_tiene_favorito: nombreUsuario
    }).select().table('Favorito').then((usuarios) => {
        usuarios.forEach(function(usuario) {
            result.push({usuario_tiene_favorito: usuario.usuario_tiene_favorito, 
                usuario_es_favorito: usuario.usuario_es_favorito})
        });
        res.status(200)
        res.send(result)
    })
})
.post(function(req,res) {
});

//Este método delega en el server.listen "nativo" de Node
app.listen(3000, function () {
    console.log("Servidor arrancado") 
});

app.post('/login', function(req, res) {
    var params = req.body
    var nombreUsuario = params.nombre_usuario
    var password = params.pass

    knex.where({
        nombre_usuario: nombreUsuario
    }).select().table('Usuario').then((usuarios) => {
        if (usuarios.length > 0) {
            if (usuarios[0].pass == password) {
                var token = jwt.encode({nombreUsuario: nombreUsuario}, tokenSecret);
                res.status(200)
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
});
