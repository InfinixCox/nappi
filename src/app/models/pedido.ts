export type EstadoPedido = 'pendiente' | 'en_cocina' | 'en_camino' | 'entregado';

export interface Pedido {
  id: number;
  cliente_id: string;
  restaurante_id: number;
  barrio_id: number;
  direccion: string;
  lat: number | null;
  lng: number | null;
  estado: EstadoPedido;
  progreso: number;
  total: number;
  created_at: string;
  restaurantes?: { nombre: string };
}
