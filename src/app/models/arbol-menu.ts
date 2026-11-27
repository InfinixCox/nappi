import { NodoMenu } from './nodo-menu';
import { Categoria } from './categoria';
import { Plato } from './plato';

export class ArbolMenu {
  raiz: NodoMenu;

  constructor(categorias: Categoria[], platos: Plato[]) {
    this.raiz = new NodoMenu('Menú');

    const nodos: { [id: number]: NodoMenu } = {};
    for (let categoria of categorias) {
      nodos[categoria.id] = new NodoMenu(categoria.nombre);
    }

    for (let categoria of categorias) {
      const padre = categoria.padre_id === null ? this.raiz : nodos[categoria.padre_id];
      padre.agregarHijo(nodos[categoria.id]);
    }

    for (let plato of platos) {
      if (nodos[plato.categoria_id]) {
        nodos[plato.categoria_id].platos.push(plato);
      }
    }
  }
}
