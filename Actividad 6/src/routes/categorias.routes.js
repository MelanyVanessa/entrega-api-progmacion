import { Router } from "express";
import { db } from "../db.js";

// server.js lo monta con app.use("/categorias", categoriasRouter)
const router = Router();

// GET /categorias/:id/productos -> JOIN (reto Actividad 4)
router.get("/:id/productos", async (req, res) => {
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

export default router;
