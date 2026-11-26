// Reglas de validacion que usan las rutas

export const CAMPOS_PRODUCTO = ["nombre", "tipo", "precio", "marca", "stock", "categoria_id"];

export function precioInvalido(precio) {
  return !(Number(precio) >= 0);
}

export function stockNegativo(stock) {
  return Number(stock) < 0;
}

