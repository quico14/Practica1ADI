
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('Usuario').del()
    .then(function () {
      return knex('sqlite_sequence').update('seq', 0).then(function () {
        return knex('Usuario').insert([
          {nombre_usuario: 'username_prueba', nombre: 'Nombre prueba', apellidos: 'Apellidos prueba', 
          pass: '1'},
          {nombre_usuario: 'username_prueba2', nombre: 'Nombre prueba2', apellidos: 'Apellidos prueba2', 
          pass: '12' },
          {nombre_usuario: 'username_prueba3', nombre: 'Nombre prueba3', apellidos: 'Apellidos prueba3', 
          pass: '123' },
          {nombre_usuario: 'username_prueba4', nombre: 'Nombre prueba4', apellidos: 'Apellidos prueba4', 
          pass: '1234' }
        ]).then(function () {
          return knex('Articulo').insert([
            {nombre: 'articulo prueba', precio: '150', cantidad: '1', 
            nombre_usuario: 'username_prueba'},
            {nombre: 'Samsung Galaxy S8', precio: '600', cantidad: '25', 
            nombre_usuario: 'username_prueba'},
            {nombre: 'Oneplus 5T', precio: '456', cantidad: '24', 
            nombre_usuario: 'username_prueba'},
            {nombre: 'PS4 PRO', precio: '367', cantidad: '23', 
            nombre_usuario: 'username_prueba'},
            {nombre: 'articulo prueba2', precio: '20', cantidad: '2', 
            nombre_usuario: 'username_prueba2'},
            {nombre: 'articulo prueba3', precio: '30', cantidad: '3', 
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
