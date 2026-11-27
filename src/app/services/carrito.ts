import { Injectable, effect, inject, signal } from '@angular/core';
import { Supabase } from './supabase';
import { Auth } from './auth';
import { ListaCarrito } from '../models/lista-carrito';
import { Pila } from '../models/pila';
import { AccionCarrito } from '../models/accion-carrito';
import { ItemCarrito } from '../models/item-carrito';
import { Plato } from '../models/plato';

@Injectable({
  providedIn: 'root',
})
export class Carrito {
  private sb = inject(Supabase).client;
  private auth = inject(Auth);

  private lista = new ListaCarrito();
  private pila = new Pila<AccionCarrito>();

  // Copias para la plantilla; se actualizan después de cada cambio
  items = signal<ItemCarrito[]>([]);
  total = signal(0);
  cantidadTotal = signal(0);
  puedeDeshacer = signal(false);

  constructor() {
    // El carrito guardado se carga cuando entra un cliente y se limpia al salir
    effect(() => {
      const perfil = this.auth.perfil();
      if (perfil && perfil.rol === 'cliente') {
        this.cargar(perfil.id);
      } else {
        this.lista.vaciar();
        this.pila = new Pila<AccionCarrito>();
        this.refrescar();
      }
    });
  }

  private refrescar(): void {
    const items = this.lista.aArreglo();
    this.items.set(items);
    this.total.set(this.lista.total());
    this.cantidadTotal.set(items.reduce((suma, item) => suma + item.cantidad, 0));
    this.puedeDeshacer.set(!this.pila.isEmpty());
  }

  private usuarioId(): string {
    return this.auth.perfil()?.id ?? '';
  }

  async cargar(userId: string): Promise<void> {
    const { data } = await this.sb
      .from('carrito_items')
      .select('cantidad, platos(*)')
      .eq('user_id', userId)
      .order('id');

    this.lista.vaciar();
    for (let fila of (data ?? []) as any[]) {
      this.lista.append({ plato: fila.platos, cantidad: fila.cantidad });
    }
    this.pila = new Pila<AccionCarrito>();
    this.refrescar();
  }

  restauranteId(): number | null {
    return this.lista.head ? this.lista.head.value.plato.restaurante_id : null;
  }

  // Devuelve '' si todo salió bien, o un texto de error
  async agregar(plato: Plato): Promise<string> {
    const nodo = this.lista.buscar(plato.id);

    if (nodo) {
      return this.cambiarCantidad(plato.id, nodo.value.cantidad + 1);
    }

    const { error } = await this.sb
      .from('carrito_items')
      .insert({ user_id: this.usuarioId(), plato_id: plato.id, cantidad: 1 });

    if (error) {
      return 'No se pudo agregar: ' + error.message;
    }

    this.lista.append({ plato: plato, cantidad: 1 });
    this.pila.push({ tipo: 'agregar', plato: plato, cantidadAnterior: 0 });
    this.refrescar();
    return '';
  }

  async cambiarCantidad(platoId: number, nueva: number): Promise<string> {
    const nodo = this.lista.buscar(platoId);

    if (!nodo) {
      return 'Ese plato ya no está en el carrito.';
    }

    if (nueva <= 0) {
      return this.quitar(platoId);
    }

    const { error } = await this.sb
      .from('carrito_items')
      .update({ cantidad: nueva })
      .eq('user_id', this.usuarioId())
      .eq('plato_id', platoId);

    if (error) {
      return 'No se pudo cambiar la cantidad: ' + error.message;
    }

    this.pila.push({ tipo: 'cantidad', plato: nodo.value.plato, cantidadAnterior: nodo.value.cantidad });
    nodo.value.cantidad = nueva;
    this.refrescar();
    return '';
  }

  async quitar(platoId: number): Promise<string> {
    const nodo = this.lista.buscar(platoId);

    if (!nodo) {
      return 'Ese plato ya no está en el carrito.';
    }

    const { error } = await this.sb
      .from('carrito_items')
      .delete()
      .eq('user_id', this.usuarioId())
      .eq('plato_id', platoId);

    if (error) {
      return 'No se pudo quitar: ' + error.message;
    }

    this.pila.push({ tipo: 'quitar', plato: nodo.value.plato, cantidadAnterior: nodo.value.cantidad });
    this.lista.eliminar(platoId);
    this.refrescar();
    return '';
  }

  // Saca la última acción de la pila y aplica la contraria (sin volver a apilar)
  async deshacer(): Promise<string> {
    const accion = this.pila.pop();

    if (!accion) {
      return 'No hay nada que deshacer.';
    }

    const usuario = this.usuarioId();
    let error = null;

    if (accion.tipo === 'agregar') {
      error = (await this.sb.from('carrito_items').delete().eq('user_id', usuario).eq('plato_id', accion.plato.id)).error;
      if (!error) this.lista.eliminar(accion.plato.id);
    } else if (accion.tipo === 'quitar') {
      error = (await this.sb.from('carrito_items').insert({ user_id: usuario, plato_id: accion.plato.id, cantidad: accion.cantidadAnterior })).error;
      if (!error) this.lista.append({ plato: accion.plato, cantidad: accion.cantidadAnterior });
    } else {
      error = (await this.sb.from('carrito_items').update({ cantidad: accion.cantidadAnterior }).eq('user_id', usuario).eq('plato_id', accion.plato.id)).error;
      const nodo = this.lista.buscar(accion.plato.id);
      if (!error && nodo) nodo.value.cantidad = accion.cantidadAnterior;
    }

    this.refrescar();
    return error ? 'No se pudo deshacer: ' + error.message : '';
  }

  descripcionDeshacer(): string {
    const accion = this.pila.peek();
    if (!accion) return '';
    if (accion.tipo === 'agregar') return 'agregar ' + accion.plato.nombre;
    if (accion.tipo === 'quitar') return 'quitar ' + accion.plato.nombre;
    return 'cambiar cantidad de ' + accion.plato.nombre;
  }

  async vaciar(): Promise<string> {
    const { error } = await this.sb.from('carrito_items').delete().eq('user_id', this.usuarioId());

    if (error) {
      return 'No se pudo vaciar el carrito: ' + error.message;
    }

    this.lista.vaciar();
    this.pila = new Pila<AccionCarrito>();
    this.refrescar();
    return '';
  }
}
