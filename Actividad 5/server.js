import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "./db.js";
import { verificarToken, soloAdmin } from "./middlewares.js";

const app = express();
app.use(express.json());

const CAMPOS = ["nombre", "tipo", "precio", "marca", "stock", "categoria_id"];

// ---------- Usuarios (Actividad 5) ----------

// POST /registro -> guarda el usuario con la clave encriptada (bcrypt.hash)
app.post("/registro", async (req, res) => {
  try {
    const { email, password, rol = "usuario" } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ error: "email y password son obligatorios" });
    }
    const hash = await bcrypt.hash(password, 10);
    const [resultado] = await db.query(
      "INSERT INTO usuarios (email, password, rol) VALUES (?, ?, ?)",
      [email, hash, rol]
    );
    res.status(201).json({ id: resultado.insertId, email, rol });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Ese email ya esta registrado" });
    }
    res.status(500).json({ error: "Error en la base de datos" });
  }
});

// POST /login -> compara la clave con bcrypt.compare y devuelve { token }
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    const [filas] = await db.query("SELECT * FROM usuarios WHERE email = ?", [email]);
    const usuario = filas[0];
    if (!usuario) {
      return res.status(401).json({ error: "Email o clave incorrectos" });
    }
    const ok = await bcrypt.compare(password, usuario.password);
    if (!ok) return res.status(401).json({ error: "Email o clave incorrectos" });
    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: "Error en la base de datos" });
  }
});

// ---------- Productos ----------

// 1. GET todos los productos -> SELECT  (reto Actividad 3: ?max=50000)
app.get("/productos", async (req, res) => {
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

// 3. POST crear producto -> INSERT (necesita token)
app.post("/productos", verificarToken, async (req, res) => {
  try {
    const { nombre, precio, stock = 0, categoria_id = null } = req.body || {};
    const tipo = req.body?.tipo || "General";
    const marca = req.body?.marca || "Sin marca";
    if (!nombre) return res.status(400).json({ error: "Falta el nombre" });
    if (precio == null || precio < 0) return res.status(400).json({ error: "Precio inválido" });
    if (stock < 0) return res.status(400).json({ error: "El stock no puede ser negativo" });

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
app.put("/productos/:id", verificarToken, async (req, res) => {
  try {
    const { nombre, precio, stock } = req.body || {};
    if (!nombre || precio == null || stock == null) {
      return res.status(400).json({ error: "Faltan campos (nombre, precio, stock)" });
    }
    if (precio < 0) return res.status(400).json({ error: "Precio inválido" });
    if (stock < 0) return res.status(400).json({ error: "El stock no puede ser negativo" });

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
app.patch("/productos/:id", verificarToken, async (req, res) => {
  try {
    const body = req.body || {};
    if (body.precio != null && body.precio < 0) return res.status(400).json({ error: "Precio inválido" });
    if (body.stock != null && body.stock < 0) return res.status(400).json({ error: "El stock no puede ser negativo" });

    const campos = Object.keys(body).filter((c) => CAMPOS.includes(c));
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
app.delete("/productos/:id", verificarToken, soloAdmin, async (req, res) => {
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

// Reto Actividad 4: productos de una categoria -> JOIN
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
