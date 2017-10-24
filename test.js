var request = require('superagent')
var exec = require('child_process').exec;
var assert = require('assert')

exec("knex seed:run")


    describe('Tests UABay', function(){
        it ('Petición a articulos de username_prueba funcionando', function(){
            request
            .get('http://localhost:3000/usuarios/username_prueba/articulos')
            .end(function(error, respuesta){
                    var body = respuesta.body
                    
                    assert(respuesta.status == 200)
                    assert(body[0].ID == 1)
                    assert(body.length == 2)
                    assert(body[0].nombre == "articulo prueba")
                    assert(body[0].cantidad == 1)
                    assert(body[0].precio == "1,50")
              })
        });

        it ('Petición a articulos de usuario inexistente', function(){
            request
            .get('http://localhost:3000/usuarios/usuario_inexistente/articulos')
            .end(function(error, respuesta){                    
                    assert(respuesta.status == 404)
                    assert(respuesta.body.error == "El usuario no existe")
              })
        });

        it ('Petición a articulos de usuario sin artículos', function(){
            request
            .get('http://localhost:3000/usuarios/username_prueba4/articulos')
            .end(function(error, respuesta){                    
                    assert(respuesta.status == 200)
                    assert(respuesta.text == "No hay artículos para este usuario")
              })
        });

        it ('Búsqueda en Ebay', function(){
            request
            .get('http://localhost:3000/ebay?busqueda=drone&limite=2')
            .end(function(error, respuesta){                    
                    assert(respuesta.status == 200)
                    assert(respuesta.body.itemSummaries.length == 2)
              })
        });

        it ('Login en UABay', function(){
            request
            .post('http://localhost:3000/login')
            .send({"nombre_usuario": "username_prueba", "pass" : 1})
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .end(function(error, respuesta){                    
                    assert(respuesta.status == 200)
                    assert(respuesta.body.token == "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJub21icmVVc3VhcmlvIjoidXNlcm5hbWVfcHJ1ZWJhIn0.W46_Rsd0CtTLfCEyC8SHJQlSf8ebyrX95VegfGbzyUo")
              })
        });

        it ('Token de usuario incorrecto al crear artículo', function(){
            request
            .post('http://localhost:3000/usuarios/username_prueba/articulos')
            .send({"cantidad": 3, "nombre" : "manzanas", "precio" : 2})
            .set('token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJub21icmVVc3VhcmlvIjoidXNlcm5hbWVfcHJ1ZWJhMiJ9.e_55tQXMcV0xCMY5twCGA1rkdsyD4-vpTluhswNKbkg')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .end(function(error, respuesta){                    
                    assert(respuesta.status == 403)
                    assert(respuesta.body.error == "No tienes permiso para hacer eso")
              })
        });

        it ('Crear artículo correctamete', function(){
            request
            .post('http://localhost:3000/usuarios/username_prueba2/articulos')
            .send({"cantidad": 3, "nombre" : "manzanas", "precio" : 2})
            .set('token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJub21icmVVc3VhcmlvIjoidXNlcm5hbWVfcHJ1ZWJhMiJ9.e_55tQXMcV0xCMY5twCGA1rkdsyD4-vpTluhswNKbkg')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .end(function(error, respuesta){                    
                    assert(respuesta.status == 201)
                    assert(respuesta.headers.location == "http://localhost:3000/usuarios/username_prueba2/articulos/5")
              })
        });

        it ('Crear artículo faltan parámetros', function(){
            request
            .post('http://localhost:3000/usuarios/username_prueba2/articulos')
            .send({"nombre" : "manzanas", "precio" : 2})
            .set('token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJub21icmVVc3VhcmlvIjoidXNlcm5hbWVfcHJ1ZWJhMiJ9.e_55tQXMcV0xCMY5twCGA1rkdsyD4-vpTluhswNKbkg')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .end(function(error, respuesta){                    
                    assert(respuesta.status == 400)
                    assert(respuesta.body.error == "faltan parámetros")
              })
        });

        it ('Petición a articulo 1 de usuario username_prueba', function(){
            request
            .get('http://localhost:3000/usuarios/username_prueba/articulos/1')
            .end(function(error, respuesta){
                    var body = respuesta.body
                    
                    assert(respuesta.status == 200)
                    assert(body.ID == 1)
                    assert(body.cantidad == 1)
                    assert(body.nombre == "articulo prueba")
                    assert(body.precio == "1,50")
              })
        });

        it ('Petición a articulo que no existe de usuario username_prueba', function(){
            request
            .get('http://localhost:3000/usuarios/username_prueba/articulos/17678678687')
            .end(function(error, respuesta){
                    var body = respuesta.body
                    
                    assert(respuesta.status == 404)
                    assert(body.error == "El recurso especificado no existe")
              })
        });

        it ('Token de usuario incorrecto al modificar artículo', function(){
            request
            .put('http://localhost:3000/usuarios/username_prueba/articulos/2')
            .send({"cantidad": 3, "nombre" : "manzanas", "precio" : 2})
            .set('token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJub21icmVVc3VhcmlvIjoidXNlcm5hbWVfcHJ1ZWJhMiJ9.e_55tQXMcV0xCMY5twCGA1rkdsyD4-vpTluhswNKbkg')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .end(function(error, respuesta){                    
                    assert(respuesta.status == 403)
                    assert(respuesta.body.error == "No tienes permiso para hacer eso")
              })
        });

        it ('Modificar artículo inexistente', function(){
            request
            .put('http://localhost:3000/usuarios/username_prueba2/articulos/278216587562')
            .send({"cantidad": 3, "nombre" : "manzanas", "precio" : 2})
            .set('token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJub21icmVVc3VhcmlvIjoidXNlcm5hbWVfcHJ1ZWJhMiJ9.e_55tQXMcV0xCMY5twCGA1rkdsyD4-vpTluhswNKbkg')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .end(function(error, respuesta){                    
                    assert(respuesta.status == 404)
                    assert(respuesta.body.error == "El recurso especificado no existe")
              })
        });

        it ('Modificar artículo correctamente', function(){
            request
            .put('http://localhost:3000/usuarios/username_prueba/articulos/2')
            .send({"cantidad": 3, "nombre" : "manzanas", "precio" : 2})
            .set('token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJub21icmVVc3VhcmlvIjoidXNlcm5hbWVfcHJ1ZWJhIn0.W46_Rsd0CtTLfCEyC8SHJQlSf8ebyrX95VegfGbzyUo')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .end(function(error, respuesta){              
                var body = respuesta.body      
                assert(respuesta.status == 201)
                assert(body.ID == 2)
                assert(body.cantidad == 3)
                assert(body.nombre == "manzanas")
                assert(body.precio == "2")
                assert(respuesta.headers.location == "http://localhost:3000/usuarios/username_prueba/articulos/2")
              })
        });

        it ('Modificar artículo faltando parámetros', function(){
            request
            .put('http://localhost:3000/usuarios/username_prueba/articulos/2')
            .send({"nombre" : "manzanas", "precio" : 2})
            .set('token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJub21icmVVc3VhcmlvIjoidXNlcm5hbWVfcHJ1ZWJhIn0.W46_Rsd0CtTLfCEyC8SHJQlSf8ebyrX95VegfGbzyUo')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .end(function(error, respuesta){              
                var body = respuesta.body      
                assert(respuesta.status == 400)
                assert(body.error == "faltan parámetros")
                })
        });

        it ('Token de usuario incorrecto al borrar artículo', function(){
            request
            .delete('http://localhost:3000/usuarios/username_prueba/articulos/2')
            .send({"cantidad": 3, "nombre" : "manzanas", "precio" : 2})
            .set('token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJub21icmVVc3VhcmlvIjoidXNlcm5hbWVfcHJ1ZWJhMiJ9.e_55tQXMcV0xCMY5twCGA1rkdsyD4-vpTluhswNKbkg')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .end(function(error, respuesta){                    
                    assert(respuesta.status == 403)
                    assert(respuesta.body.error == "No tienes permiso para hacer eso")
              })
        });

        it ('Borrar artículo inexistente', function(){
            request
            .delete('http://localhost:3000/usuarios/username_prueba2/articulos/278216587562')
            .send({"cantidad": 3, "nombre" : "manzanas", "precio" : 2})
            .set('token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJub21icmVVc3VhcmlvIjoidXNlcm5hbWVfcHJ1ZWJhMiJ9.e_55tQXMcV0xCMY5twCGA1rkdsyD4-vpTluhswNKbkg')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .end(function(error, respuesta){                    
                    assert(respuesta.status == 404)
                    assert(respuesta.body.error == "El recurso especificado no existe")
              })
        });

        it ('Borrar artículo correctamente', function(){
            request
            .delete('http://localhost:3000/usuarios/username_prueba/articulos/2')
            .set('token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJub21icmVVc3VhcmlvIjoidXNlcm5hbWVfcHJ1ZWJhIn0.W46_Rsd0CtTLfCEyC8SHJQlSf8ebyrX95VegfGbzyUo')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .end(function(error, respuesta){              
                var body = respuesta.body      
                assert(respuesta.status == 204)
                })
        });

        it ('Petición a favoritos de usuario inexistente', function(){
            request
            .get('http://localhost:3000/usuarios/usuario_inexistente/favoritos')
            .end(function(error, respuesta){                    
                    assert(respuesta.status == 404)
                    assert(respuesta.body.error == "El recurso especificado no existe")
              })
        });

        it ('Petición a favoritos de usuario username_prueba', function(){
            request
            .get('http://localhost:3000/usuarios/username_prueba/favoritos')
            .end(function(error, respuesta){ 
                var body = respuesta.body                   
                    assert(respuesta.status == 200)
                    assert(body.length == 2)
                    assert(body[0].usuario_es_favorito == "username_prueba2")
                    assert(body[0].usuario_tiene_favorito == "username_prueba")
              })
        });

        it ('Token de usuario incorrecto al crear un nuevo usuario favorito', function(){
            request
            .post('http://localhost:3000/usuarios/username_prueba/favoritos')
            .send({"favorito": "username_prueba2"})
            .set('token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJub21icmVVc3VhcmlvIjoidXNlcm5hbWVfcHJ1ZWJhMiJ9.e_55tQXMcV0xCMY5twCGA1rkdsyD4-vpTluhswNKbkg')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .end(function(error, respuesta){                    
                    assert(respuesta.status == 403)
                    assert(respuesta.body.error == "No tienes permiso para hacer eso")
              })
        });

        it ('Creado nuevo usuario favorito correctamente', function(){
            request
            .post('http://localhost:3000/usuarios/username_prueba2/favoritos')
            .send({"favorito": "username_prueba3"})
            .set('token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJub21icmVVc3VhcmlvIjoidXNlcm5hbWVfcHJ1ZWJhMiJ9.e_55tQXMcV0xCMY5twCGA1rkdsyD4-vpTluhswNKbkg')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .end(function(error, respuesta){     
                    var body = respuesta.body               
                    assert(respuesta.status == 200)
                    assert(body.usuario_es_favorito == "username_prueba3")
                    assert(body.usuario_tiene_favorito == "username_prueba2")
              })
        });
        
      })