import { ItemCarrito } from './item-carrito';

// Igual al SongNode del challenge de listas
export class NodoCarrito {
  value: ItemCarrito;
  next: NodoCarrito | null;

  constructor(value: ItemCarrito) {
    this.value = value;
    this.next = null;
  }
}
