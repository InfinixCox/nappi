import { Injectable, inject } from '@angular/core';
import { Supabase } from './supabase';

@Injectable({
  providedIn: 'root',
})
export class Pedidos {
  private sb = inject(Supabase).client;

  // RLS ya filtra: el cliente solo recibe sus propios pedidos
  listarMios() {
    return this.sb
      .from('pedidos')
      .select('*, restaurantes(nombre)')
      .order('created_at', { ascending: false });
  }
}
