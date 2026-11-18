import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: process.env.DB_PASSWORD,
  database: "productos_capilares",
  decimalNumbers: true, // el precio llega como numero (69000) y no como texto ("69000.00")
});
