# Actividad 4: API con MySQL

Los mismos endpoints de la Actividad 3, ahora guardando los datos en MySQL.

## Cómo ejecutarla

1. Tener MySQL encendido (puerto 3306).
2. Instalar dependencias: `npm install`
3. Copiar `.env.example` como `.env` y poner la clave de MySQL.
4. Crear la base con los 25 productos: `npm run setup-db`
   (o ejecutar `productos_capilares.sql` en HeidiSQL / Workbench).
5. Arrancar: `npm start` → `http://localhost:3000`

## Endpoints

| Método | Ruta | SQL |
|---|---|---|
| GET | `/productos` | SELECT |
| GET | `/productos/:id` | SELECT |
| POST | `/productos` | INSERT |
| PUT | `/productos/:id` | UPDATE |
| PATCH | `/productos/:id` | UPDATE |
| DELETE | `/productos/:id` | DELETE |
| GET | `/categorias/:id/productos` | SELECT con JOIN (reto) |

- Todas las consultas usan `?`.
- Si `affectedRows` es 0 o no hay filas, responde 404.
- Si la base falla, responde 500.

Las peticiones de prueba están en `Actividad 4.postman_collection.json`.
