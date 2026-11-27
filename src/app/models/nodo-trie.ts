import { ResultadoBusqueda } from './resultado-busqueda';

export class NodoTrie {
  value: string | null;
  isEndOfWord: boolean;
  children: { [letra: string]: NodoTrie };
  // Adaptación: varias cosas pueden terminar en la misma palabra ("la", "pollo"...)
  resultados: ResultadoBusqueda[];

  constructor(value: string | null) {
    this.value = value;
    this.isEndOfWord = false;
    this.children = {};
    this.resultados = [];
  }
}
