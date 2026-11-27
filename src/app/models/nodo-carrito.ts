import { ItemCarrito } from './item-carrito';

export class NodoCarrito {
  value: ItemCarrito;
  next: NodoCarrito | null;

  constructor(value: ItemCarrito) {
    this.value = value;
    this.next = null;
  }
}
