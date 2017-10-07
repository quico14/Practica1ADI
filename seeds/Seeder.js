
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('Usuario').del()
    .then(function () {
      return knex('sqlite_sequence').update('seq', 0).then(function () {
        return knex('Usuario').insert([
          {nombre_usuario: 'username_prueba', nombre: 'Nombre prueba', apellidos: 'Apellidos prueba', 
          contraseña: '1'},
          {nombre_usuario: 'username_prueba2', nombre: 'Nombre prueba2', apellidos: 'Apellidos prueba2', 
          contraseña: '12' },
          {nombre_usuario: 'username_prueba3', nombre: 'Nombre prueba3', apellidos: 'Apellidos prueba3', 
          contraseña: '123' }
        ]).then(function () {
          return knex('Articulo').insert([
            {nombre: 'articulo prueba', precio: '1,50', cantidad: '1', 
            nombre_usuario: 'username_prueba'},
            {nombre: 'Samsung Galaxy S8', precio: '600,64', cantidad: '25', 
            nombre_usuario: 'username_prueba'},
            {nombre: 'articulo prueba2', precio: '2,50', cantidad: '2', 
            nombre_usuario: 'username_prueba2'},
            {nombre: 'articulo prueba3', precio: '3,50', cantidad: '3', 
            nombre_usuario: 'username_prueba3'}
          ])
        }).then(function (){
          return knex('Favorito').insert([
            {usuario_tiene_favorito: 'username_prueba', usuario_es_favorito: 'username_prueba3'},
            {usuario_tiene_favorito: 'username_prueba', usuario_es_favorito: 'username_prueba2'},
            {usuario_tiene_favorito: 'username_prueba2', usuario_es_favorito: 'username_prueba'}
          ])
        })
      })
    });
};
