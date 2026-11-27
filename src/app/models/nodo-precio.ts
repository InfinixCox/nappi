import { Plato } from './plato';

// Como el Nodo del Challenge 06; adaptación: guarda la lista de platos con ese precio
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
