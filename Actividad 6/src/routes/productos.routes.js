import { Router } from "express";
import { db } from "../db.js";
import { verificarToken, soloAdmin } from "../middlewares/auth.middleware.js";
import { CAMPOS_PRODUCTO, precioInvalido, stockNegativo } from "../validaciones.js";

// server.js lo monta con app.use("/productos", productosRouter): aqui las rutas son "/" y "/:id"
const router = Router();

// 1. GET todos los productos -> SELECT  (reto Actividad 3: ?max=50000)
router.get("/", async (req, res) => {
  try {
    const { max } = req.query;
    if (max) {
      const [filas] = await db.query("SELECT * FROM productos WHERE precio <= ?", [Number(max)]);
      return res.status(200).json(filas);
    }
    const [filas] = await db.query("SELECT * FROM productos");
    res.status(200).json(filas);
  } catch (error) {
    res.status(500).json({ error: "Error en la base de datos" });
  }
});

// 2. GET un producto por id -> SELECT
router.get("/:id", async (req, res) => {
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

// 3. POST crear producto -> INSERT (necesita token)
router.post("/", verificarToken, async (req, res) => {
  try {
    const { nombre, precio, stock = 0, categoria_id = null } = req.body || {};
    const tipo = req.body?.tipo || "General";
    const marca = req.body?.marca || "Sin marca";
    if (!nombre) return res.status(400).json({ error: "Falta el nombre" });
    if (precio == null || precioInvalido(precio)) return res.status(400).json({ error: "Precio inválido" });
    if (stockNegativo(stock)) return res.status(400).json({ error: "El stock no puede ser negativo" });

    const [resultado] = await db.query(
      "INSERT INTO productos (nombre, tipo, precio, marca, stock, categoria_id) VALUES (?, ?, ?, ?, ?, ?)",
      [nombre, tipo, precio, marca, stock, categoria_id]
    );
    res.status(201).json({ id: resultado.insertId, nombre, tipo, precio, marca, stock, categoria_id });
  } catch (error) {
    res.status(500).json({ error: "Error en la base de datos" });
  }
});

// 4. PUT reemplazar producto -> UPDATE (necesita token)
router.put("/:id", verificarToken, async (req, res) => {
  try {
    const { nombre, precio, stock } = req.body || {};
    if (!nombre || precio == null || stock == null) {
      return res.status(400).json({ error: "Faltan campos (nombre, precio, stock)" });
    }
    if (precioInvalido(precio)) return res.status(400).json({ error: "Precio inválido" });
    if (stockNegativo(stock)) return res.status(400).json({ error: "El stock no puede ser negativo" });

    const [resultado] = await db.query(
      "UPDATE productos SET nombre = ?, precio = ?, stock = ? WHERE id = ?",
      [nombre, precio, stock, req.params.id]
    );
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: "No existe" });
    }
    const [filas] = await db.query("SELECT * FROM productos WHERE id = ?", [req.params.id]);
    res.status(200).json(filas[0]);
  } catch (error) {
    res.status(500).json({ error: "Error en la base de datos" });
  }
});

// 5. PATCH actualizar solo algunos campos -> UPDATE (necesita token)
router.patch("/:id", verificarToken, async (req, res) => {
  try {
    const body = req.body || {};
    if (body.precio != null && precioInvalido(body.precio)) return res.status(400).json({ error: "Precio inválido" });
    if (body.stock != null && stockNegativo(body.stock)) return res.status(400).json({ error: "El stock no puede ser negativo" });

    const campos = Object.keys(body).filter((c) => CAMPOS_PRODUCTO.includes(c));
    if (campos.length === 0) {
      return res.status(400).json({ error: "Envia al menos un campo para actualizar" });
    }
    // Los nombres de columna salen de la lista CAMPOS; los valores van siempre con ?
    const sets = campos.map((c) => `${c} = ?`).join(", ");
    const valores = campos.map((c) => body[c]);
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

// 6. DELETE eliminar producto -> DELETE (necesita token + admin)
router.delete("/:id", verificarToken, soloAdmin, async (req, res) => {
  try {
    const [resultado] = await db.query("DELETE FROM productos WHERE id = ?", [req.params.id]);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: "No existe" });
    }
    res.status(204).end(); // 204 = borrado, sin cuerpo
  } catch (error) {
    res.status(500).json({ error: "Error en la base de datos" });
  }
});

export default router;
