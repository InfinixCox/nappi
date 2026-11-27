import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Auth } from '../../services/auth';
import { Pedidos } from '../../services/pedidos';
import { Pedido } from '../../models/pedido';

@Component({
  selector: 'app-mis-pedidos',
  imports: [DatePipe],
  templateUrl: './mis-pedidos.html',
  styleUrl: './mis-pedidos.scss',
})
export class MisPedidos implements OnInit, OnDestroy {
  private auth = inject(Auth);
  private pedidosServicio = inject(Pedidos);
  private canal: RealtimeChannel | null = null;

  pedidos = signal<Pedido[]>([]);
  cargando = signal(true);
  mensaje = signal('');

  async ngOnInit(): Promise<void> {
    const { data, error } = await this.pedidosServicio.listarMios();

    if (error) {
      this.mensaje.set('No pudimos traer tus pedidos: ' + error.message);
    } else {
      this.pedidos.set(data ?? []);
    }

    this.cargando.set(false);

    // Tiempo real: el estado cambia apenas el restaurante lo avanza
    const { data: sesion } = await this.auth.obtenerSesion();
    if (sesion.session) {
      this.canal = this.pedidosServicio.escuchar('cliente_id=eq.' + sesion.session.user.id, (payload) => {
        if (payload.eventType === 'UPDATE') {
          this.pedidos.update(lista => lista.map(p =>
            p.id === payload.new.id ? { ...p, estado: payload.new.estado, progreso: payload.new.progreso } : p));
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.canal) {
      this.pedidosServicio.dejarDeEscuchar(this.canal);
    }
  }

  formatoPrecio(valor: number): string {
    return '$ ' + valor.toLocaleString('es-CO');
  }

  textoEstado(estado: string): string {
    if (estado === 'pendiente') return 'Pendiente';
    if (estado === 'en_cocina') return 'En cocina';
    if (estado === 'en_camino') return 'En camino';
    return 'Entregado';
  }
}
