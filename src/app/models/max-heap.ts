import { Plato } from './plato';

export class MaxHeap {
  heap: Plato[];

  constructor() {
    this.heap = [];
  }

  push(value: Plato): void {
    this.heap.push(value);
    this.percolateUp();
  }

  pop(): Plato | undefined {
    if (this.heap.length === 0) return undefined;
    const n = this.heap.length;
    this.swap(0, n - 1);
    const max = this.heap.pop();
    this.percolateDown(0);
    return max;
  }

  percolateDown(index: number): void {
    let curr = index;
    while (2 * curr + 1 < this.heap.length) {
      const left = 2 * curr + 1;
      const right = 2 * curr + 2;
      const maxChild =
        right < this.heap.length && this.heap[right].veces_pedido > this.heap[left].veces_pedido
          ? right
          : left;
      if (this.heap[maxChild].veces_pedido > this.heap[curr].veces_pedido) {
        this.swap(curr, maxChild);
        curr = maxChild;
      } else {
        break;
      }
    }
  }

  percolateUp(): void {
    let curr = this.heap.length - 1;
    while (curr > 0) {
      const parent = Math.floor((curr - 1) / 2);
      if (this.heap[curr].veces_pedido > this.heap[parent].veces_pedido) {
        this.swap(curr, parent);
        curr = parent;
      } else {
        break;
      }
    }
  }

  swap(i: number, j: number): void {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  size(): number {
    return this.heap.length;
  }
}
