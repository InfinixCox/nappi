import { NodoPrecio } from './nodo-precio';
import { Plato } from './plato';

// Árbol binario de búsqueda por precio: insertar y buscar como en el Challenge 06
export class ArbolPrecios {
  raiz: NodoPrecio | null;

  constructor() {
    this.raiz = null;
  }

  insertar(plato: Plato): void {
    // Adaptación: si el precio ya existe, el plato se agrega a ese nodo
    const existente = this.buscar(plato.precio);
    if (existente) {
      existente.platos.push(plato);
      return;
    }

    const nuevoNodo = new NodoPrecio(plato);

    if (!this.raiz) {
      this.raiz = nuevoNodo;
      return;
    }

    let actual = this.raiz;

    while (true) {
      if (plato.precio < actual.valor) {
        if (!actual.izquierda) {
          actual.izquierda = nuevoNodo;
          return;
        }
        actual = actual.izquierda;
      } else {
        if (!actual.derecha) {
          actual.derecha = nuevoNodo;
          return;
        }
        actual = actual.derecha;
      }
    }
  }

  buscar(valor: number): NodoPrecio | null {
    let actual = this.raiz;

    while (actual) {
      if (valor === actual.valor) {
        return actual;
      }

      if (valor < actual.valor) {
        actual = actual.izquierda;
      } else {
        actual = actual.derecha;
      }
    }

    return null;
  }

  // Adaptación del inorden: solo entra a las ramas que pueden tener precios del rango,
  // así los platos salen ordenados de menor a mayor
  rango(min: number, max: number): Plato[] {
    const resultado: Plato[] = [];
    this.inordenRango(this.raiz, min, max, resultado);
    return resultado;
  }

  private inordenRango(nodo: NodoPrecio | null, min: number, max: number, resultado: Plato[]): void {
    if (!nodo) return;

    if (nodo.valor > min) {
      this.inordenRango(nodo.izquierda, min, max, resultado);
    }

    if (nodo.valor >= min && nodo.valor <= max) {
      resultado.push(...nodo.platos);
    }

    if (nodo.valor < max) {
      this.inordenRango(nodo.derecha, min, max, resultado);
    }
  }
}
