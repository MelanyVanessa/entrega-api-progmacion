import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db.js";

const router = Router();


router.post("/registro", async (req, res) => {
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
router.post("/login", async (req, res) => {
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

export default router;
