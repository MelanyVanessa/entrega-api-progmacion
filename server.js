import express from "express";
import { db } from "./db.js";

const app = express();
app.use(express.json());

const CAMPOS = ["nombre", "tipo", "precio", "marca", "stock", "categoria_id"];

// 1. GET todos los productos -> SELECT
app.get("/productos", async (req, res) => {
  try {
    const [filas] = await db.query("SELECT * FROM productos");
    res.status(200).json(filas);
  } catch (error) {
    res.status(500).json({ error: "Error en la base de datos" });
  }
});

// 2. GET un producto por id -> SELECT
app.get("/productos/:id", async (req, res) => {
  try {
    const [filas] = await db.query("SELECT * FROM productos WHERE id = ?", [req.params.id]);
    if (filas.length === 0) {
      return res.status(404).json({ error: "No existe" });
    }
    res.status(200).json(filas[0]);
  } catch (error) {
    res.status(500).json({ error: "Error en la base de datos" });
  }
});

// 3. POST crear producto -> INSERT
app.post("/productos", async (req, res) => {
  try {
    const { nombre, tipo, precio, marca, stock = 0, categoria_id = null } = req.body;
    if (!nombre || !tipo || precio == null || !marca) {
      return res.status(400).json({ error: "nombre, tipo, precio y marca son obligatorios" });
    }
    const [resultado] = await db.query(
      "INSERT INTO productos (nombre, tipo, precio, marca, stock, categoria_id) VALUES (?, ?, ?, ?, ?, ?)",
      [nombre, tipo, precio, marca, stock, categoria_id]
    );
    res.status(201).json({ id: resultado.insertId, nombre, tipo, precio, marca, stock, categoria_id });
  } catch (error) {
    res.status(500).json({ error: "Error en la base de datos" });
  }
});

// 4. PUT reemplazar producto completo -> UPDATE
app.put("/productos/:id", async (req, res) => {
  try {
    const { nombre, tipo, precio, marca, stock = 0, categoria_id = null } = req.body;
    if (!nombre || !tipo || precio == null || !marca) {
      return res.status(400).json({ error: "PUT necesita nombre, tipo, precio y marca" });
    }
    const [resultado] = await db.query(
      "UPDATE productos SET nombre = ?, tipo = ?, precio = ?, marca = ?, stock = ?, categoria_id = ? WHERE id = ?",
      [nombre, tipo, precio, marca, stock, categoria_id, req.params.id]
    );
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: "No existe" });
    }
    res.status(200).json({ id: Number(req.params.id), nombre, tipo, precio, marca, stock, categoria_id });
  } catch (error) {
    res.status(500).json({ error: "Error en la base de datos" });
  }
});

// 5. PATCH actualizar solo algunos campos -> UPDATE
app.patch("/productos/:id", async (req, res) => {
  try {
    const campos = Object.keys(req.body).filter((c) => CAMPOS.includes(c));
    if (campos.length === 0) {
      return res.status(400).json({ error: "Envia al menos un campo para actualizar" });
    }
    // Los nombres de columna salen de la lista CAMPOS; los valores van siempre con ?
    const sets = campos.map((c) => `${c} = ?`).join(", ");
    const valores = campos.map((c) => req.body[c]);
    const [resultado] = await db.query(`UPDATE productos SET ${sets} WHERE id = ?`, [...valores, req.params.id]);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: "No existe" });
    }
    const [filas] = await db.query("SELECT * FROM productos WHERE id = ?", [req.params.id]);
    res.status(200).json(filas[0]);
  } catch (error) {
    res.status(500).json({ error: "Error en la base de datos" });
  }
});

// 6. DELETE eliminar producto -> DELETE
app.delete("/productos/:id", async (req, res) => {
  try {
    const [resultado] = await db.query("DELETE FROM productos WHERE id = ?", [req.params.id]);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: "No existe" });
    }
    res.status(200).json({ mensaje: "Producto eliminado" });
  } catch (error) {
    res.status(500).json({ error: "Error en la base de datos" });
  }
});

// Reto: productos de una categoria -> JOIN
app.get("/categorias/:id/productos", async (req, res) => {
  try {
    const [filas] = await db.query(
      `SELECT p.id, p.nombre, p.tipo, p.precio, p.marca, p.stock, c.nombre AS categoria
       FROM productos p
       JOIN categorias c ON p.categoria_id = c.id
       WHERE c.id = ?`,
      [req.params.id]
    );
    if (filas.length === 0) {
      return res.status(404).json({ error: "No existe la categoria o no tiene productos" });
    }
    res.status(200).json(filas);
  } catch (error) {
    res.status(500).json({ error: "Error en la base de datos" });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`API en http://localhost:${PORT}`));
