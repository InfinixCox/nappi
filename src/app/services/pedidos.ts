import { Injectable, inject } from '@angular/core';
import { Supabase } from './supabase';
import { ItemCarrito } from '../models/item-carrito';

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
}
