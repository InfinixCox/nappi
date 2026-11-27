import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';
import { Barrios } from '../../services/barrios';
import { Catalogo } from '../../services/catalogo';
import { Barrio } from '../../models/barrio';
import { Restaurante } from '../../models/restaurante';
import { Plato } from '../../models/plato';
import { Grafo } from '../../models/grafo';
import { Trie } from '../../models/trie';
import { MaxHeap } from '../../models/max-heap';
import { ResultadoBusqueda } from '../../models/resultado-busqueda';
import { Buscador } from '../../components/buscador/buscador';
import { TopPlatos } from '../../components/top-platos/top-platos';
import { TarjetaRestaurante } from '../../components/tarjeta-restaurante/tarjeta-restaurante';

@Component({
  selector: 'app-inicio',
  imports: [FormsModule, Buscador, TopPlatos, TarjetaRestaurante],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
})
export class Inicio implements OnInit {
  auth = inject(Auth);
  private barriosServicio = inject(Barrios);
  private catalogo = inject(Catalogo);

  private grafo = new Grafo();
  private trie = new Trie();

  barrios = signal<Barrio[]>([]);
  restaurantes = signal<Restaurante[]>([]);
  barrioId = signal(0);
  textoBusqueda = signal('');
  resultados = signal<ResultadoBusqueda[]>([]);
  top = signal<Plato[]>([]);
  cargando = signal(true);
  mensaje = signal('');

  constructor() {
    effect(() => {
      const perfil = this.auth.perfil();
      if (perfil && perfil.barrio_id && this.barrioId() === 0) {
        this.barrioId.set(perfil.barrio_id);
      }
    });
  }

  async ngOnInit(): Promise<void> {
    const [barrios, vecinos, restaurantes, platos] = await Promise.all([
      this.barriosServicio.listar(),
      this.catalogo.listarVecinos(),
      this.catalogo.listarRestaurantes(),
      this.catalogo.listarTodosLosPlatos(),
    ]);

    if (barrios.error || vecinos.error || restaurantes.error || platos.error) {
      this.mensaje.set('No pudimos cargar el catálogo. Revisa tu conexión e intenta otra vez.');
      this.cargando.set(false);
      return;
    }

    this.barrios.set(barrios.data);
    this.restaurantes.set(restaurantes.data);

    for (let barrio of barrios.data) {
      this.grafo.addNode(barrio);
    }
    for (let arista of vecinos.data) {
      this.grafo.addEdge(String(arista.barrio_a), String(arista.barrio_b));
    }

    for (let restaurante of restaurantes.data as Restaurante[]) {
      const resultado: ResultadoBusqueda = {
        tipo: 'restaurante', texto: restaurante.nombre, detalle: restaurante.tipo, restauranteId: restaurante.id,
      };
      for (let palabra of restaurante.nombre.split(' ')) {
        this.trie.insert(palabra, resultado);
      }
    }
    for (let plato of platos.data as Plato[]) {
      const resultado: ResultadoBusqueda = {
        tipo: 'plato', texto: plato.nombre, detalle: plato.restaurantes?.nombre ?? '', restauranteId: plato.restaurante_id,
      };
      for (let palabra of plato.nombre.split(' ')) {
        this.trie.insert(palabra, resultado);
      }
    }

    const heap = new MaxHeap();
    for (let plato of platos.data as Plato[]) {
      if (plato.veces_pedido > 0) {
        heap.push(plato);
      }
    }
    const top: Plato[] = [];
    while (top.length < 5 && heap.size() > 0) {
      top.push(heap.pop()!);
    }
    this.top.set(top);

    this.cargando.set(false);
  }

  buscar(texto: string): void {
    this.textoBusqueda.set(texto);
    this.resultados.set(texto.trim() === '' ? [] : this.trie.searchPrefix(texto));
  }

  entregaEnMiBarrio(restaurante: Restaurante): boolean {
    if (this.barrioId() === 0) {
      return true;
    }
    return this.grafo.barriosConCobertura(String(this.barrioId())).includes(String(restaurante.barrio_id));
  }

  restaurantesCerca(): Restaurante[] {
    return this.restaurantes().filter(r => this.entregaEnMiBarrio(r));
  }

  restaurantesLejos(): Restaurante[] {
    return this.restaurantes().filter(r => !this.entregaEnMiBarrio(r));
  }
}
