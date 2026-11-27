import { ResultadoBusqueda } from './resultado-busqueda';

export class NodoTrie {
  value: string | null;
  isEndOfWord: boolean;
  children: { [letra: string]: NodoTrie };
  resultados: ResultadoBusqueda[];

  constructor(value: string | null) {
    this.value = value;
    this.isEndOfWord = false;
    this.children = {};
    this.resultados = [];
  }
}
