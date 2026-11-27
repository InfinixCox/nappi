import { Plato } from './plato';

export class NodoMenu {
  titulo: string;
  platos: Plato[];
  hijos: NodoMenu[];

  constructor(titulo: string) {
    this.titulo = titulo;
    this.platos = [];
    this.hijos = [];
  }

  agregarHijo(nodo: NodoMenu): void {
    this.hijos.push(nodo);
  }
}
