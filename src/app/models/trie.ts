import { NodoTrie } from './nodo-trie';
import { ResultadoBusqueda } from './resultado-busqueda';

// Igual al Trie del Parcial 03 (insert y searchPrefix con recolección recursiva)
export class Trie {
  root: NodoTrie;

  constructor() {
    this.root = new NodoTrie(null);
  }

  insert(palabra: string, resultado: ResultadoBusqueda): void {
    let current = this.root;
    for (let character of this.normalizar(palabra)) {
      if (current.children[character] === undefined) {
        current.children[character] = new NodoTrie(character);
      }
      current = current.children[character];
    }
    current.isEndOfWord = true;
    current.resultados.push(resultado);
  }

  searchPrefix(prefix: string): ResultadoBusqueda[] {
    let current = this.root;
    for (let character of this.normalizar(prefix)) {
      if (current.children[character] === undefined) {
        return [];
      }
      current = current.children[character];
    }
    const resultado: ResultadoBusqueda[] = [];
    this.recolectar(current, resultado);
    return resultado;
  }

  private recolectar(nodo: NodoTrie, resultado: ResultadoBusqueda[]): void {
    if (nodo.isEndOfWord) {
      for (let item of nodo.resultados) {
        // Un mismo plato se inserta por cada palabra: no se repite en la lista
        if (!resultado.includes(item)) {
          resultado.push(item);
        }
      }
    }
    for (let letra in nodo.children) {
      this.recolectar(nodo.children[letra], resultado);
    }
  }

  // Minúsculas y sin tildes, para que "polemica" encuentre "Polémica"
  private normalizar(texto: string): string {
    return texto.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }
}
