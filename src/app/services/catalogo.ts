import { Injectable, inject } from '@angular/core';
import { Supabase } from './supabase';

@Injectable({
  providedIn: 'root',
})
export class Catalogo {
  private sb = inject(Supabase).client;

  listarRestaurantes() {
    return this.sb.from('restaurantes').select('*').order('nombre');
  }

  obtenerRestaurante(id: number) {
    return this.sb.from('restaurantes').select('*').eq('id', id).maybeSingle();
  }

  listarCategorias(restauranteId: number) {
    return this.sb.from('categorias').select('*').eq('restaurante_id', restauranteId).order('orden');
  }

  listarPlatos(restauranteId: number) {
    return this.sb.from('platos').select('*').eq('restaurante_id', restauranteId).eq('disponible', true);
  }

  listarTodosLosPlatos() {
    return this.sb.from('platos').select('*, restaurantes(nombre)').eq('disponible', true);
  }

  listarVecinos() {
    return this.sb.from('barrios_vecinos').select('*');
  }

  // URL pública de una imagen del bucket (como el avatar del Challenge 10)
  urlImagen(ruta: string): string {
    return this.sb.storage.from('imagenes').getPublicUrl(ruta).data.publicUrl;
  }

  formatoPrecio(valor: number): string {
    return '$ ' + valor.toLocaleString('es-CO');
  }
}
