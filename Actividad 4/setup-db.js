// Crea la base de datos, la tabla y los 25 productos.
// Uso: npm run setup-db
import mysql from "mysql2/promise";
import { readFile } from "node:fs/promises";

const sql = await readFile(new URL("./productos_capilares.sql", import.meta.url), "utf8");

const conn = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.DB_PASSWORD,
  multipleStatements: true,
});

await conn.query(sql);
const [rows] = await conn.query("SELECT COUNT(*) AS total FROM productos_capilares.productos");
console.log(`Listo: ${rows[0].total} productos en productos_capilares.productos`);
await conn.end();
