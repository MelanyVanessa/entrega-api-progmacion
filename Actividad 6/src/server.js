// server.js solo conecta las piezas: cada recurso vive en su router
import express from "express";
import authRouter from "./routes/auth.routes.js";
import productosRouter from "./routes/productos.routes.js";
import categoriasRouter from "./routes/categorias.routes.js";

const app = express();
app.use(express.json());

app.use("/", authRouter); 
app.use("/productos", productosRouter);
app.use("/categorias", categoriasRouter);

const PORT = 3000;
app.listen(PORT, () => console.log(`API en http://localhost:${PORT}`));
