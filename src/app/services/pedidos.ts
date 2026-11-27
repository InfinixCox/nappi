import { Injectable, inject } from '@angular/core';
import { Supabase } from './supabase';
import { ItemCarrito } from '../models/item-carrito';
import { RealtimeChannel } from '@supabase/supabase-js';
import { EstadoPedido, PedidoItem } from '../models/pedido';

@Injectable({
  providedIn: 'root',
})
export class Pedidos {
  private sb = inject(Supabase).client;

  // Primero el pedido y luego sus items (inserts como en el Challenge 10)
  async crear(datos: {
    clienteId: string; restauranteId: number; barrioId: number;
    direccion: string; lat: number; lng: number; total: number;
  }, items: ItemCarrito[]): Promise<{ id: number | null; error: string }> {
    const { data, error } = await this.sb
      .from('pedidos')
      .insert({
        cliente_id: datos.clienteId,
        restaurante_id: datos.restauranteId,
        barrio_id: datos.barrioId,
        direccion: datos.direccion,
        lat: datos.lat,
        lng: datos.lng,
        total: datos.total,
      })
      .select('id')
      .single();

    if (error || !data) {
      return { id: null, error: error ? error.message : 'No se creó el pedido.' };
    }

    const filas = items.map(item => ({
      pedido_id: data.id,
      plato_id: item.plato.id,
      nombre: item.plato.nombre,
      cantidad: item.cantidad,
      precio_unitario: item.plato.precio,
    }));

    const respuesta = await this.sb.from('pedido_items').insert(filas);

    if (respuesta.error) {
      return { id: data.id, error: respuesta.error.message };
    }

    return { id: data.id, error: '' };
  }

  // RLS ya filtra: el cliente solo recibe sus propios pedidos
  listarMios() {
    return this.sb
      .from('pedidos')
      .select('*, restaurantes(nombre)')
      .order('created_at', { ascending: false });
  }

  // ===== Panel del restaurante =====
  obtenerMiRestaurante(ownerId: string) {
    return this.sb.from('restaurantes').select('*').eq('owner_id', ownerId).maybeSingle();
  }

  // Pedidos que aún no se entregan, del más viejo al más nuevo (orden de llegada)
  listarActivos(restauranteId: number) {
    return this.sb
      .from('pedidos')
      .select('*, barrios(nombre), pedido_items(*)')
      .eq('restaurante_id', restauranteId)
      .neq('estado', 'entregado')
      .order('created_at', { ascending: true });
  }

  obtener(id: number) {
    return this.sb
      .from('pedidos')
      .select('*, barrios(nombre), restaurantes(nombre), pedido_items(*)')
      .eq('id', id)
      .maybeSingle();
  }

  actualizar(id: number, estado: EstadoPedido, progreso: number) {
    return this.sb.from('pedidos').update({ estado: estado, progreso: progreso }).eq('id', id);
  }

  // Al entregar, cada plato suma las unidades vendidas (alimenta el Top 5 del Max Heap)
  async sumarVecesPedido(items: PedidoItem[]): Promise<string> {
    for (let item of items) {
      const { data, error } = await this.sb.from('platos').select('veces_pedido').eq('id', item.plato_id).single();
      if (error || !data) return error ? error.message : 'Plato no encontrado';

      const respuesta = await this.sb
        .from('platos')
        .update({ veces_pedido: data.veces_pedido + item.cantidad })
        .eq('id', item.plato_id);
      if (respuesta.error) return respuesta.error.message;
    }
    return '';
  }

  // ===== Tiempo real (como escuchar() del Challenge 10, con filtro) =====
  escuchar(filtro: string, alCambiar: (payload: any) => void) {
    return this.sb
      .channel('pedidos-ng-' + Date.now())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos', filter: filtro }, alCambiar)
      .subscribe();
  }

  dejarDeEscuchar(canal: RealtimeChannel) {
    return this.sb.removeChannel(canal);
  }
}
