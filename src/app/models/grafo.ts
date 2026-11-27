import { Barrio } from './barrio';

// Grafo no dirigido de barrios: igual al del Challenge 11 (lista de adyacencia)
export class Grafo {
  nodes: Barrio[];
  adjList: { [id: string]: string[] };

  constructor() {
    this.nodes = [];
    this.adjList = {};
  }

  addNode(node: Barrio): void {
    if (!this.searchNode(String(node.id))) {
      this.nodes.push(node);
      this.adjList[String(node.id)] = [];
    }
  }

  addEdge(id1: string, id2: string): boolean {
    if (!this.searchNode(id1) || !this.searchNode(id2) || id1 === id2) {
      return false;
    }

    if (this.adjList[id1].includes(id2)) {
      return false;
    }

    this.adjList[id1].push(id2);
    this.adjList[id2].push(id1);
    return true;
  }

  searchNode(id: string): Barrio | undefined {
    if (!this.nodes.length) return undefined;
    return this.nodes.find(n => String(n.id) === id);
  }

  // Cobertura: el barrio y sus vecinos directos (como personasDeCiudad del Challenge 11)
  barriosConCobertura(id: string): string[] {
    const vecinos = this.adjList[id];

    if (!vecinos) {
      return [];
    }

    return [id, ...vecinos];
  }
}
