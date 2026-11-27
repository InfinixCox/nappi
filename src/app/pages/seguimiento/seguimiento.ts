import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RealtimeChannel } from '@supabase/supabase-js';
import * as L from 'leaflet';
import { Pedidos } from '../../services/pedidos';
import { Mapa } from '../../services/mapa';
import { Catalogo } from '../../services/catalogo';
import { Pedido } from '../../models/pedido';
import { LineaEstados } from '../../components/linea-estados/linea-estados';

@Component({
  selector: 'app-seguimiento',
  imports: [RouterLink, LineaEstados],
  templateUrl: './seguimiento.html',
  styleUrl: './seguimiento.scss',
})
export class Seguimiento implements OnInit, OnDestroy {
  private ruta = inject(ActivatedRoute);
  private pedidos = inject(Pedidos);
  private mapaServicio = inject(Mapa);
  catalogo = inject(Catalogo);

  // Adaptación: Leaflet se usa directamente, como d3 en el Challenge 11
  private mapa: L.Map | null = null;
  private puntosRuta: [number, number][] = [];
  private domiciliario: L.Marker | null = null;
  private canal: RealtimeChannel | null = null;

  pedido = signal<Pedido | null>(null);
  mensaje = signal('');

  async ngOnInit(): Promise<void> {
    const id = Number(this.ruta.snapshot.paramMap.get('id'));
    const { data, error } = await this.pedidos.obtener(id);

    if (error || !data) {
      this.mensaje.set('No encontramos ese pedido.');
      return;
    }

    this.pedido.set(data);
    this.crearMapa(data);
    await this.actualizarDomiciliario();

    this.canal = this.pedidos.escuchar('id=eq.' + id, async (payload) => {
      if (payload.eventType === 'UPDATE') {
        this.pedido.update(p => p ? { ...p, estado: payload.new.estado, progreso: payload.new.progreso } : p);
        await this.actualizarDomiciliario();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.canal) this.pedidos.dejarDeEscuchar(this.canal);
    this.mapa?.remove();
  }

  private crearMapa(pedido: Pedido): void {
    const restaurante: [number, number] = [pedido.restaurantes?.lat ?? 3.45, pedido.restaurantes?.lng ?? -76.53];
    const cliente: [number, number] = [pedido.lat ?? restaurante[0], pedido.lng ?? restaurante[1]];

    this.mapa = L.map('mapa-seguimiento').setView(restaurante, 14);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.mapa);

    L.circleMarker(restaurante, { radius: 10, color: '#2f6f5e', fillOpacity: 0.9 })
      .addTo(this.mapa).bindTooltip(pedido.restaurantes?.nombre ?? 'Restaurante');
    L.circleMarker(cliente, { radius: 10, color: '#f2b134', fillOpacity: 0.9 })
      .addTo(this.mapa).bindTooltip('Tu casa');

    this.mapa.fitBounds(L.latLngBounds([restaurante, cliente]), { padding: [40, 40] });
  }

  // Cuando el pedido va en camino: pide la ruta a OSRM (una vez) y ubica al domiciliario según el progreso
  private async actualizarDomiciliario(): Promise<void> {
    const pedido = this.pedido();
    if (!pedido || !this.mapa || (pedido.estado !== 'en_camino' && pedido.estado !== 'entregado')) {
      return;
    }

    if (this.puntosRuta.length === 0) {
      const origen: [number, number] = [pedido.restaurantes?.lat ?? 0, pedido.restaurantes?.lng ?? 0];
      const destino: [number, number] = [pedido.lat ?? 0, pedido.lng ?? 0];
      this.puntosRuta = await this.mapaServicio.ruta(origen, destino);
      L.polyline(this.puntosRuta, { color: '#2f6f5e', weight: 5 }).addTo(this.mapa);
    }

    const indice = Math.round((pedido.progreso / 100) * (this.puntosRuta.length - 1));
    const posicion = this.puntosRuta[indice];

    if (!this.domiciliario) {
      const icono = L.divIcon({ className: 'icono-domiciliario', html: '🛵', iconSize: [32, 32] });
      this.domiciliario = L.marker(posicion, { icon: icono }).addTo(this.mapa).bindTooltip('Tu domiciliario');
    } else {
      this.domiciliario.setLatLng(posicion);
    }
  }

  textoEstado(): string {
    const pedido = this.pedido();
    if (!pedido) return '';
    if (pedido.estado === 'pendiente') return 'El restaurante ya vio tu pedido… o eso creemos.';
    if (pedido.estado === 'en_cocina') return 'Están cocinando con amor (y con prisa).';
    if (pedido.estado === 'en_camino') return 'El domiciliario va volando… bueno, en moto. ' + pedido.progreso + '% del camino.';
    return '¡Llegó! Buen provecho.';
  }
}
