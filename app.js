//Cargamos el módulo express
var express = require('express');
var app = express();

var bodyParser = require('body-parser');

app.use(bodyParser.json());

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


//Middleware que hace un log del momento en que se ha hecho cada petición
//También se puede usar en una función, poniendo los mismos parámetros que aquí
app.use(function (req, res, next) {
    console.log('Petición en :', Date.now());
    //LLamamos a next para que se siga ejecutando el resto de middlewares
    //Si no hiciéramos esto, la respuesta se quedaría pendiente
    next();
});

app.route('/usuarios/:nombre_usuario/articulos')
.get(function(req,res) {
})
.post(function(req,res) {
})
.put(function(req,res) {
})
.delete(function(req,res) {
});

app.get('/usuarios/:nombre_usuario/articulos/:id', function(req,res) {
});

app.route('/usuarios/:nombre_usuario/favoritos')
.get(function(req,res) {
})
.post(function(req,res) {
});

//Este método delega en el server.listen "nativo" de Node
app.listen(3000, function () {
    lista = new Map() 
    lista.set(1, {id:1, nombre:"Ron", cantidad:"1 botella"})
    lista.set(2, {id:2, nombre:"Tomates", cantidad:"1 kg"})
    console.log("Servidor arrancado") 
});

app.get('/login', function(req, res) {
    var select = knex.select().table('Usuario').then((usuario) => {
        var usuario1 = usuario[0].nombre_usuario
        res.status(201)
        res.send(usuario1);
    })
    
});
