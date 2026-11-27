export interface Plato {
  id: number;
  restaurante_id: number;
  categoria_id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_path: string;
  veces_pedido: number;
  disponible: boolean;
  restaurantes?: { nombre: string };
}
