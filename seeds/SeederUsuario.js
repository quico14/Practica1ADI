
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('Usuario').del()
    .then(function () {
      // Inserts seed entries
      return knex('Usuario').insert([
        {nombre_usuario: 'prueba', nombre: 'Nombre prueba', apellidos: 'Apellidos prueba', 
        contraseña: '1'},
        {nombre_usuario: 'prueba2', nombre: 'Nombre prueba2', apellidos: 'Apellidos prueba2', 
        contraseña: '12' },
        {nombre_usuario: 'prueba3', nombre: 'Nombre prueba3', apellidos: 'Apellidos prueba3', 
        contraseña: '123' }
      ]);
    });
};
