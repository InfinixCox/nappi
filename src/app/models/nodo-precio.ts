import { Plato } from './plato';

export class NodoPrecio {
  valor: number;
  platos: Plato[];
  izquierda: NodoPrecio | null;
  derecha: NodoPrecio | null;

  constructor(plato: Plato) {
    this.valor = plato.precio;
    this.platos = [plato];
    this.izquierda = null;
    this.derecha = null;
  }
}
