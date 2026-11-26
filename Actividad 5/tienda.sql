-- Actividad 5: la tabla nueva (usuarios)
-- Ejecutar completo en HeidiSQL con F9 (sin seleccionar nada)

USE productos_capilares;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'usuario'
);

-- password guarda el hash, nunca la clave:
-- await bcrypt.hash(password, 10)

SELECT * FROM usuarios;
