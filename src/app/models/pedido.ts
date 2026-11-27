export type EstadoPedido = 'pendiente' | 'en_cocina' | 'en_camino' | 'entregado';

export interface PedidoItem {
  plato_id: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
}

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
  restaurantes?: { nombre: string; lat?: number; lng?: number; napa?: string };
  barrios?: { nombre: string };
  pedido_items?: PedidoItem[];
}
