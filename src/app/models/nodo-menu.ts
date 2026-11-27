import { Plato } from './plato';

// Igual al NodoMenu del Challenge 07; cada categoría guarda además sus platos
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
