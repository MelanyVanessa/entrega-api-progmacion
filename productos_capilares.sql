-- Base de datos de productos capilares
-- Ejecutar completo en HeidiSQL con F9 (sin seleccionar nada)

CREATE DATABASE IF NOT EXISTS productos_capilares;

DROP TABLE IF EXISTS productos_capilares.productos;
DROP TABLE IF EXISTS productos_capilares.categorias;

-- Reto: tabla de categorias
CREATE TABLE productos_capilares.categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO productos_capilares.categorias (nombre) VALUES
('Limpieza'),       -- 1: shampoos
('Acondicionado'),  -- 2: acondicionadores
('Mascarillas'),    -- 3: mascarillas
('Tratamientos'),   -- 4: serum, aceite, tonico, locion, ampolla
('Peinado');        -- 5: termoprotector, crema, gel, spray

CREATE TABLE productos_capilares.productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  marca VARCHAR(50) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  categoria_id INT NULL,
  FOREIGN KEY (categoria_id) REFERENCES productos_capilares.categorias(id)
);

INSERT INTO productos_capilares.productos (nombre, tipo, precio, marca, stock) VALUES
-- Milagros
('Shampoo profesional reparacion intensiva', 'Shampoo', 69000, 'Milagros', 10),
('Acondicionador profesional reparacion intensiva', 'Acondicionador', 72900, 'Milagros', 8),
('Mascarilla reparadora', 'Mascarilla', 85000, 'Milagros', 12),
('Termoprotector', 'Termoprotector', 58000, 'Milagros', 15),
('Serum de puntas', 'Serum', 62000, 'Milagros', 9),

-- By Mariana Zapata
('Shampoo hidratante', 'Shampoo', 55000, 'By Mariana Zapata', 20),
('Acondicionador hidratante', 'Acondicionador', 57000, 'By Mariana Zapata', 18),
('Mascarilla nutritiva', 'Mascarilla', 68000, 'By Mariana Zapata', 10),
('Crema para peinar', 'Crema para peinar', 49000, 'By Mariana Zapata', 14),
('Aceite capilar', 'Aceite', 52000, 'By Mariana Zapata', 11),

-- La Pocion
('Shampoo anticaida', 'Shampoo', 45000, 'La Pocion', 25),
('Acondicionador anticaida', 'Acondicionador', 47000, 'La Pocion', 22),
('Tonico capilar de crecimiento', 'Tonico', 54000, 'La Pocion', 16),
('Mascarilla fortalecedora', 'Mascarilla', 59000, 'La Pocion', 13),
('Locion para cuero cabelludo', 'Locion', 50000, 'La Pocion', 17),

-- Origen Botanico
('Shampoo de romero', 'Shampoo', 38000, 'Origen Botanico', 30),
('Acondicionador de romero', 'Acondicionador', 40000, 'Origen Botanico', 28),
('Mascarilla de aguacate', 'Mascarilla', 46000, 'Origen Botanico', 19),
('Aceite de ricino', 'Aceite', 35000, 'Origen Botanico', 24),
('Gel de sabila para rizos', 'Gel', 33000, 'Origen Botanico', 21),

-- Lluvia de Estrellas
('Shampoo matizador', 'Shampoo', 42000, 'Lluvia de Estrellas', 15),
('Acondicionador matizador', 'Acondicionador', 44000, 'Lluvia de Estrellas', 14),
('Mascarilla de keratina', 'Mascarilla', 56000, 'Lluvia de Estrellas', 10),
('Spray desenredante', 'Spray', 36000, 'Lluvia de Estrellas', 20),
('Ampolla de brillo', 'Ampolla', 15000, 'Lluvia de Estrellas', 40);

-- Asignar categoria segun el tipo
UPDATE productos_capilares.productos SET categoria_id = CASE
  WHEN tipo = 'Shampoo' THEN 1
  WHEN tipo = 'Acondicionador' THEN 2
  WHEN tipo = 'Mascarilla' THEN 3
  WHEN tipo IN ('Serum', 'Aceite', 'Tonico', 'Locion', 'Ampolla') THEN 4
  ELSE 5
END
WHERE id > 0;

SELECT * FROM productos_capilares.productos;
