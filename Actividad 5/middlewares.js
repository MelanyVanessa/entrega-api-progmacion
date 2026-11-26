import jwt from "jsonwebtoken";

// Revisa que venga "Authorization: Bearer <token>" y que el token sea valido
export function verificarToken(req, res, next) {
  const header = req.headers.authorization ?? "";
  const [tipo, token] = header.split(" ");
  if (tipo !== "Bearer" || !token) {
    return res.status(401).json({ error: "Falta el token" });
  }
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Token inválido o vencido" });
  }
}

// Solo deja pasar si el usuario del token es admin (va DESPUES de verificarToken)
export function soloAdmin(req, res, next) {
  if (req.usuario?.rol !== "admin") {
    return res.status(403).json({ error: "Solo un admin puede hacer esto" });
  }
  next();
}
