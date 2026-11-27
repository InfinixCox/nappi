import { NodoCarrito } from './nodo-carrito';
import { ItemCarrito } from './item-carrito';

export class ListaCarrito {
  head: NodoCarrito | null = null;
  tail: NodoCarrito | null = null;
  length: number = 0;

  append(item: ItemCarrito): void {
    const newNode = new NodoCarrito(item);

    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      if (this.tail) {
        this.tail.next = newNode;
      }
      this.tail = newNode;
    }
    this.length++;
  }

  buscar(platoId: number): NodoCarrito | null {
    let actual = this.head;

    while (actual) {
      if (actual.value.plato.id === platoId) {
        return actual;
      }
      actual = actual.next;
    }

    return null;
  }

  eliminar(platoId: number): boolean {
    if (!this.head) {
      return false;
    }

    if (this.head.value.plato.id === platoId) {
      this.head = this.head.next;
      if (!this.head) {
        this.tail = null;
      }
      this.length--;
      return true;
    }

    let anterior = this.head;
    let actual = this.head.next;

    while (actual) {
      if (actual.value.plato.id === platoId) {
        anterior.next = actual.next;
        if (actual === this.tail) {
          this.tail = anterior;
        }
        this.length--;
        return true;
      }
      anterior = actual;
      actual = actual.next;
    }

    return false;
  }

  total(): number {
    let suma = 0;
    let actual = this.head;

    while (actual) {
      suma += actual.value.plato.precio * actual.value.cantidad;
      actual = actual.next;
    }

    return suma;
  }

  aArreglo(): ItemCarrito[] {
    const items: ItemCarrito[] = [];
    let actual = this.head;

    while (actual) {
      items.push(actual.value);
      actual = actual.next;
    }

    return items;
  }

  vaciar(): void {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }
}
