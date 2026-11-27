import { NodoPrecio } from './nodo-precio';
import { Plato } from './plato';

export class ArbolPrecios {
  raiz: NodoPrecio | null;

  constructor() {
    this.raiz = null;
  }

  insertar(plato: Plato): void {
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
