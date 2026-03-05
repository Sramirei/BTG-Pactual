DROP DATABASE IF EXISTS "BTG";
CREATE DATABASE "BTG";

\connect "BTG"

CREATE SCHEMA IF NOT EXISTS btg;
SET search_path TO btg, public;

-- Tabla cliente: almacena los datos básicos de los clientes.
CREATE TABLE btg.cliente (
    id BIGINT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(150) NOT NULL,
    ciudad VARCHAR(100) NOT NULL
);

COMMENT ON TABLE btg.cliente IS 'Clientes registrados en el sistema.';
COMMENT ON COLUMN btg.cliente.id IS 'Identificador único del cliente.';
COMMENT ON COLUMN btg.cliente.nombre IS 'Nombre del cliente.';
COMMENT ON COLUMN btg.cliente.apellidos IS 'Apellidos del cliente.';
COMMENT ON COLUMN btg.cliente.ciudad IS 'Ciudad de residencia del cliente.';

-- Tabla sucursal: representa las sedes físicas.
CREATE TABLE btg.sucursal (
    id BIGINT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    ciudad VARCHAR(100) NOT NULL
);

COMMENT ON TABLE btg.sucursal IS 'Sucursales disponibles para atención de clientes.';
COMMENT ON COLUMN btg.sucursal.id IS 'Identificador único de la sucursal.';
COMMENT ON COLUMN btg.sucursal.nombre IS 'Nombre de la sucursal.';
COMMENT ON COLUMN btg.sucursal.ciudad IS 'Ciudad donde opera la sucursal.';

-- Tabla producto: catálogo de productos.
CREATE TABLE btg.producto (
    id BIGINT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    "tipoProducto" VARCHAR(100) NOT NULL
);

COMMENT ON TABLE btg.producto IS 'Productos que pueden ser contratados por clientes.';
COMMENT ON COLUMN btg.producto.id IS 'Identificador único del producto.';
COMMENT ON COLUMN btg.producto.nombre IS 'Nombre comercial del producto.';
COMMENT ON COLUMN btg.producto."tipoProducto" IS 'Tipo o categoría del producto.';

-- Tabla inscripcion: relación N:M entre cliente y producto.
CREATE TABLE btg.inscripcion (
    "idProducto" BIGINT NOT NULL,
    "idCliente" BIGINT NOT NULL,
    CONSTRAINT pk_inscripcion PRIMARY KEY ("idProducto", "idCliente"),
    CONSTRAINT fk_inscripcion_producto FOREIGN KEY ("idProducto")
        REFERENCES btg.producto(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,
    CONSTRAINT fk_inscripcion_cliente FOREIGN KEY ("idCliente")
        REFERENCES btg.cliente(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
);

COMMENT ON TABLE btg.inscripcion IS 'Inscripciones de clientes a productos.';
COMMENT ON COLUMN btg.inscripcion."idProducto" IS 'Producto al que se inscribe el cliente.';
COMMENT ON COLUMN btg.inscripcion."idCliente" IS 'Cliente inscrito al producto.';

-- Tabla disponibilidad: relación N:M entre sucursal y producto.
CREATE TABLE btg.disponibilidad (
    "idSucursal" BIGINT NOT NULL,
    "idProducto" BIGINT NOT NULL,
    CONSTRAINT pk_disponibilidad PRIMARY KEY ("idSucursal", "idProducto"),
    CONSTRAINT fk_disponibilidad_sucursal FOREIGN KEY ("idSucursal")
        REFERENCES btg.sucursal(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,
    CONSTRAINT fk_disponibilidad_producto FOREIGN KEY ("idProducto")
        REFERENCES btg.producto(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
);

COMMENT ON TABLE btg.disponibilidad IS 'Disponibilidad de productos por sucursal.';
COMMENT ON COLUMN btg.disponibilidad."idSucursal" IS 'Sucursal que ofrece el producto.';
COMMENT ON COLUMN btg.disponibilidad."idProducto" IS 'Producto ofrecido en la sucursal.';

-- Tabla visitan: relación N:M entre cliente y sucursal con fecha de visita.
CREATE TABLE btg.visitan (
    "idSucursal" BIGINT NOT NULL,
    "idCliente" BIGINT NOT NULL,
    "fechaVisita" DATE NOT NULL,
    CONSTRAINT pk_visitan PRIMARY KEY ("idSucursal", "idCliente"),
    CONSTRAINT fk_visitan_sucursal FOREIGN KEY ("idSucursal")
        REFERENCES btg.sucursal(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,
    CONSTRAINT fk_visitan_cliente FOREIGN KEY ("idCliente")
        REFERENCES btg.cliente(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
);

COMMENT ON TABLE btg.visitan IS 'Registro de sucursales visitadas por cada cliente.';
COMMENT ON COLUMN btg.visitan."idSucursal" IS 'Sucursal visitada.';
COMMENT ON COLUMN btg.visitan."idCliente" IS 'Cliente que realizó la visita.';
COMMENT ON COLUMN btg.visitan."fechaVisita" IS 'Fecha en la que ocurrió la visita.';

CREATE INDEX idx_inscripcion_idcliente ON btg.inscripcion ("idCliente");
CREATE INDEX idx_disponibilidad_idproducto ON btg.disponibilidad ("idProducto");
CREATE INDEX idx_visitan_idcliente ON btg.visitan ("idCliente");

-- Datos de prueba: 20 registros por tabla.
INSERT INTO btg.cliente (id, nombre, apellidos, ciudad) VALUES
    (1, 'Ana', 'Gomez', 'Bogota'),
    (2, 'Luis', 'Perez', 'Medellin'),
    (3, 'Carlos', 'Rojas', 'Cali'),
    (4, 'Maria', 'Torres', 'Barranquilla'),
    (5, 'Sofia', 'Martinez', 'Cartagena'),
    (6, 'Diego', 'Ramirez', 'Bogota'),
    (7, 'Valentina', 'Castro', 'Medellin'),
    (8, 'Andres', 'Herrera', 'Cali'),
    (9, 'Laura', 'Fernandez', 'Bucaramanga'),
    (10, 'Javier', 'Morales', 'Pereira'),
    (11, 'Camila', 'Diaz', 'Manizales'),
    (12, 'Mateo', 'Vargas', 'Cucuta'),
    (13, 'Paula', 'Navarro', 'Ibague'),
    (14, 'Felipe', 'Gutierrez', 'Santa Marta'),
    (15, 'Daniela', 'Mendoza', 'Villavicencio'),
    (16, 'Juan', 'Sanchez', 'Pasto'),
    (17, 'Natalia', 'Ruiz', 'Neiva'),
    (18, 'Sebastian', 'Lozano', 'Tunja'),
    (19, 'Juliana', 'Ortega', 'Monteria'),
    (20, 'Ricardo', 'Pineda', 'Armenia');

INSERT INTO btg.sucursal (id, nombre, ciudad) VALUES
    (1, 'Centro Bogota', 'Bogota'),
    (2, 'Norte Bogota', 'Bogota'),
    (3, 'Poblado', 'Medellin'),
    (4, 'Laureles', 'Medellin'),
    (5, 'Chipichape', 'Cali'),
    (6, 'San Fernando', 'Cali'),
    (7, 'Prado', 'Barranquilla'),
    (8, 'Bocagrande', 'Cartagena'),
    (9, 'Cabecera', 'Bucaramanga'),
    (10, 'Circunvalar', 'Pereira'),
    (11, 'Cable', 'Manizales'),
    (12, 'Ventura', 'Cucuta'),
    (13, 'Mirolindo', 'Ibague'),
    (14, 'Rodadero', 'Santa Marta'),
    (15, 'Primavera', 'Villavicencio'),
    (16, 'Unicentro Pasto', 'Pasto'),
    (17, 'Altico', 'Neiva'),
    (18, 'Centro Tunja', 'Tunja'),
    (19, 'Alamedas', 'Monteria'),
    (20, 'Quindio Plaza', 'Armenia');

INSERT INTO btg.producto (id, nombre, "tipoProducto") VALUES
    (1, 'Cuenta Ahorros', 'Banca'),
    (2, 'Cuenta Corriente', 'Banca'),
    (3, 'CDT Plus', 'Inversion'),
    (4, 'Fondo Moderado', 'Inversion'),
    (5, 'Tarjeta Gold', 'Tarjeta'),
    (6, 'Tarjeta Platinum', 'Tarjeta'),
    (7, 'Credito Libre Inversion', 'Credito'),
    (8, 'Credito Hipotecario', 'Credito'),
    (9, 'Seguro Vida', 'Seguro'),
    (10, 'Seguro Hogar', 'Seguro'),
    (11, 'Leasing Vehicular', 'Leasing'),
    (12, 'Factoring Empresarial', 'Empresarial'),
    (13, 'Nomina Plus', 'Servicios'),
    (14, 'Portal Empresas', 'Digital'),
    (15, 'Divisas FX', 'Tesoreria'),
    (16, 'Bono Corporativo', 'Inversion'),
    (17, 'Plan Pensional', 'Ahorro'),
    (18, 'Fiducia Patrimonial', 'Fiducia'),
    (19, 'Pagos Internacionales', 'Servicios'),
    (20, 'Cuenta Digital', 'Banca');

INSERT INTO btg.inscripcion ("idProducto", "idCliente") VALUES
    (1, 1),
    (2, 2),
    (3, 3),
    (4, 4),
    (5, 5),
    (6, 6),
    (7, 7),
    (8, 8),
    (9, 9),
    (10, 10),
    (11, 11),
    (12, 12),
    (13, 13),
    (14, 14),
    (15, 15),
    (16, 16),
    (17, 17),
    (18, 18),
    (19, 19),
    (20, 20);

INSERT INTO btg.disponibilidad ("idSucursal", "idProducto") VALUES
    (1, 1),
    (2, 2),
    (3, 3),
    (4, 4),
    (5, 5),
    (6, 6),
    (7, 7),
    (8, 8),
    (9, 9),
    (10, 10),
    (1, 11),
    (2, 12),
    (3, 13),
    (4, 14),
    (5, 15),
    (11, 1),
    (12, 2),
    (13, 3),
    (14, 4),
    (15, 5);

INSERT INTO btg.visitan ("idSucursal", "idCliente", "fechaVisita") VALUES
    (1, 1, '2026-01-05'),
    (2, 2, '2026-01-06'),
    (3, 3, '2026-01-07'),
    (4, 4, '2026-01-08'),
    (5, 5, '2026-01-09'),
    (6, 6, '2026-01-10'),
    (7, 7, '2026-01-11'),
    (8, 8, '2026-01-12'),
    (9, 9, '2026-01-13'),
    (10, 10, '2026-01-14'),
    (11, 11, '2026-01-15'),
    (12, 12, '2026-01-16'),
    (13, 13, '2026-01-17'),
    (14, 14, '2026-01-18'),
    (15, 15, '2026-01-19'),
    (16, 16, '2026-01-20'),
    (17, 17, '2026-01-21'),
    (18, 18, '2026-01-22'),
    (19, 19, '2026-01-23'),
    (20, 20, '2026-01-24');

-- Obtener los nombres de los clientes que tienen inscrito algún producto
-- que está disponible únicamente en las sucursales que ellos visitan.
SELECT DISTINCT c.nombre
FROM btg.cliente AS c
JOIN btg.inscripcion AS i
  ON i."idCliente" = c.id
WHERE EXISTS (
    SELECT 1
    FROM btg.disponibilidad AS d0
    WHERE d0."idProducto" = i."idProducto"
)
AND NOT EXISTS (
    SELECT 1
    FROM btg.disponibilidad AS d
    WHERE d."idProducto" = i."idProducto"
      AND NOT EXISTS (
          SELECT 1
          FROM btg.visitan AS v
          WHERE v."idCliente" = i."idCliente"
            AND v."idSucursal" = d."idSucursal"
      )
);
