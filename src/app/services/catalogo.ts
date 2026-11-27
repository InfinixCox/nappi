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

  urlImagen(ruta: string): string {
    return this.sb.storage.from('imagenes').getPublicUrl(ruta).data.publicUrl;
  }

  formatoPrecio(valor: number): string {
    return '$ ' + valor.toLocaleString('es-CO');
  }

  listarPlatosPanel(restauranteId: number) {
    return this.sb.from('platos').select('*').eq('restaurante_id', restauranteId).order('nombre');
  }

  crearCategoria(restauranteId: number, nombre: string, padreId: number | null) {
    return this.sb.from('categorias').insert({ restaurante_id: restauranteId, nombre: nombre, padre_id: padreId });
  }

  crearPlato(datos: { restaurante_id: number; categoria_id: number; nombre: string; descripcion: string; precio: number; imagen_path: string }) {
    return this.sb.from('platos').insert(datos);
  }

  actualizarPlato(id: number, datos: { categoria_id?: number; nombre?: string; descripcion?: string; precio?: number; imagen_path?: string; disponible?: boolean }) {
    return this.sb.from('platos').update(datos).eq('id', id);
  }

  async subirImagen(slug: string, archivo: File): Promise<{ ruta: string; error: string }> {
    if (!archivo.type.startsWith('image/')) {
      return { ruta: '', error: 'Solo se permiten imágenes.' };
    }

    if (archivo.size > 2 * 1024 * 1024) {
      return { ruta: '', error: 'La imagen no puede pesar más de 2 MB.' };
    }

    const extension = archivo.name.split('.').pop();
    const ruta = `${slug}/${Date.now()}.${extension}`;
    const { error } = await this.sb.storage.from('imagenes').upload(ruta, archivo, { upsert: true });

    return { ruta: error ? '' : ruta, error: error ? error.message : '' };
  }
}
