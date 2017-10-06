BEGIN TRANSACTION;
CREATE TABLE `favorito` (
	`usuario_tiene_favorito`	TEXT,
	`usuario_es_favorito`	TEXT,
	PRIMARY KEY(usuario_tiene_favorito,usuario_es_favorito),
	FOREIGN KEY(`usuario_tiene_favorito`) REFERENCES Usuario,
	FOREIGN KEY(`usuario_es_favorito`) REFERENCES Usuario
);
CREATE TABLE `Usuario` (
	`nombre_usuario`	TEXT,
	`nombre`	TEXT NOT NULL,
	`apellidos`	TEXT NOT NULL,
	`contraseña`	TEXT NOT NULL,
	PRIMARY KEY(nombre_usuario)
);
CREATE TABLE "Pedido" (
	`ID`	INTEGER PRIMARY KEY AUTOINCREMENT,
	`precio_total`	REAL NOT NULL DEFAULT 0,
	`nombre_usuario`	INTEGER NOT NULL,
	`fecha`	TEXT NOT NULL,
	FOREIGN KEY(`nombre_usuario`) REFERENCES Usuario
);
CREATE TABLE "Linea_Pedido_Articulo" (
	`ID_linea_pedido`	INTEGER,
	`ID_articulo`	INTEGER,
	PRIMARY KEY(ID_linea_pedido,ID_articulo),
	FOREIGN KEY(`ID_linea_pedido`) REFERENCES Linea_Pedido,
	FOREIGN KEY(`ID_articulo`) REFERENCES Articulo
);
CREATE TABLE "Linea_Pedido" (
	`ID`	INTEGER PRIMARY KEY AUTOINCREMENT,
	`precio_total`	REAL NOT NULL,
	`cantidad`	INTEGER NOT NULL,
	`ID_pedido`	INTEGER NOT NULL,
	FOREIGN KEY(`ID_pedido`) REFERENCES Pedido
);
CREATE TABLE `Categoria_Articulo` (
	`ID_articulo`	INTEGER,
	`ID_categoria`	INTEGER,
	PRIMARY KEY(ID_articulo,ID_categoria),
	FOREIGN KEY(`ID_articulo`) REFERENCES Articulo,
	FOREIGN KEY(`ID_categoria`) REFERENCES Categoria
);
CREATE TABLE `Categoria` (
	`nombre`	TEXT,
	PRIMARY KEY(nombre)
);
CREATE TABLE `Articulo` (
	`ID`	INTEGER PRIMARY KEY AUTOINCREMENT,
	`nombre`	TEXT NOT NULL,
	`precio`	REAL NOT NULL,
	`cantidad`	INTEGER NOT NULL,
	`nombre_usuario`	TEXT,
	FOREIGN KEY(`nombre_usuario`) REFERENCES Usuario
);
COMMIT;
