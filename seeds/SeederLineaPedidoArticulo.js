
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('Linea_Pedido_Articulo').del()
    .then(function () {
      // Inserts seed entries
      return knex('Linea_Pedido_Articulo').insert([
        {ID_linea_pedido: 1, ID_articulo: 1},
        {ID_linea_pedido: 2, ID_articulo: 1},
        {ID_linea_pedido: 3, ID_articulo: 1}
      ]);
    });
};
