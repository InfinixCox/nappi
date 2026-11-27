import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { Barrios } from '../../services/barrios';
import { Catalogo } from '../../services/catalogo';
import { Grafo } from '../../models/grafo';
import { Restaurante } from '../../models/restaurante';

@Component({
  selector: 'app-cobertura',
  imports: [FormsModule],
  templateUrl: './cobertura.html',
  styleUrl: './cobertura.scss',
})
export class Cobertura implements OnInit, OnDestroy {
  private barriosServicio = inject(Barrios);
  private catalogo = inject(Catalogo);

  private grafo = new Grafo();
  // Adaptación: Leaflet se usa directamente, como d3 en el Challenge 11
  private mapa: L.Map | null = null;
  private circulos: { [id: string]: L.CircleMarker } = {};

  restaurantes = signal<Restaurante[]>([]);
  restauranteId = signal(0);
  barriosCubiertos = signal<string[]>([]);
  mensaje = signal('');

  async ngOnInit(): Promise<void> {
    const [barrios, vecinos, restaurantes] = await Promise.all([
      this.barriosServicio.listar(),
      this.catalogo.listarVecinos(),
      this.catalogo.listarRestaurantes(),
    ]);

    if (barrios.error || vecinos.error || restaurantes.error) {
      this.mensaje.set('No pudimos cargar el mapa de cobertura.');
      return;
    }

    for (let barrio of barrios.data) this.grafo.addNode(barrio);
    for (let arista of vecinos.data) this.grafo.addEdge(String(arista.barrio_a), String(arista.barrio_b));
    this.restaurantes.set(restaurantes.data);

    this.dibujar();
  }

  ngOnDestroy(): void {
    this.mapa?.remove();
  }

  // Nodos del grafo = círculos; aristas (lista de adyacencia) = líneas
  private dibujar(): void {
    this.mapa = L.map('mapa-cobertura').setView([3.43, -76.535], 12);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.mapa);

    for (let id in this.grafo.adjList) {
      const origen = this.grafo.searchNode(id)!;
      for (let vecinoId of this.grafo.adjList[id]) {
        // Cada arista aparece dos veces (no dirigido): se dibuja solo una
        if (Number(id) < Number(vecinoId)) {
          const destino = this.grafo.searchNode(vecinoId)!;
          L.polyline([[origen.lat, origen.lng], [destino.lat, destino.lng]], { color: '#8a949c', weight: 2, dashArray: '4 6' })
            .addTo(this.mapa);
        }
      }
    }

    for (let barrio of this.grafo.nodes) {
      this.circulos[String(barrio.id)] = L.circleMarker([barrio.lat, barrio.lng], {
        radius: 9, color: '#5f6b76', fillColor: '#ffffff', fillOpacity: 1,
      }).addTo(this.mapa).bindTooltip(barrio.nombre, { permanent: true, direction: 'top', offset: [0, -8] });
    }

    for (let restaurante of this.restaurantes()) {
      const icono = L.divIcon({ className: 'icono-domiciliario', html: '🍽️', iconSize: [32, 32] });
      L.marker([restaurante.lat, restaurante.lng], { icon: icono })
        .addTo(this.mapa)
        .bindTooltip(restaurante.nombre)
        .on('click', () => this.elegir(restaurante.id));
    }
  }

  elegir(id: number): void {
    this.restauranteId.set(id);
    const restaurante = this.restaurantes().find(r => r.id === id);
    const cubiertos = restaurante ? this.grafo.barriosConCobertura(String(restaurante.barrio_id)) : [];
    this.barriosCubiertos.set(cubiertos);

    for (let barrioId in this.circulos) {
      const cubierto = cubiertos.includes(barrioId);
      this.circulos[barrioId].setStyle({
        color: cubierto ? '#2f6f5e' : '#5f6b76',
        fillColor: cubierto ? '#2f6f5e' : '#ffffff',
      });
    }
  }

  nombresCubiertos(): string {
    return this.barriosCubiertos().map(id => this.grafo.searchNode(id)?.nombre).join(', ');
  }
}
