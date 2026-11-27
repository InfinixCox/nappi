import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Auth } from '../../services/auth';
import { Pedidos } from '../../services/pedidos';
import { Pedido } from '../../models/pedido';
import { Cola } from '../../models/cola';
import { TarjetaPedido } from '../../components/tarjeta-pedido/tarjeta-pedido';

@Component({
  selector: 'app-panel-pedidos',
  imports: [TarjetaPedido],
  templateUrl: './panel-pedidos.html',
  styleUrl: './panel-pedidos.scss',
})
export class PanelPedidos implements OnInit, OnDestroy {
  private auth = inject(Auth);
  private pedidos = inject(Pedidos);

  private cola = new Cola<Pedido>();
  private canal: RealtimeChannel | null = null;

  pendientes = signal<Pedido[]>([]);
  enCurso = signal<Pedido[]>([]);
  siguiente = signal<Pedido | null>(null);
  mensaje = signal('');
  cargando = signal(true);

  async ngOnInit(): Promise<void> {
    const { data: sesion } = await this.auth.obtenerSesion();
    const ownerId = sesion.session?.user.id ?? '';
    const { data: restaurante } = await this.pedidos.obtenerMiRestaurante(ownerId);

    if (!restaurante) {
      this.mensaje.set('Esta cuenta no tiene un restaurante asignado.');
      this.cargando.set(false);
      return;
    }

    const { data, error } = await this.pedidos.listarActivos(restaurante.id);
    if (error) {
      this.mensaje.set('No pudimos traer los pedidos: ' + error.message);
    }

    // Los pendientes entran a la cola en orden de llegada
    const activos = (data ?? []) as Pedido[];
    for (let pedido of activos) {
      if (pedido.estado === 'pendiente') {
        this.cola.enqueue(pedido);
      }
    }
    this.enCurso.set(activos.filter(p => p.estado !== 'pendiente'));
    this.refrescarCola();
    this.cargando.set(false);

    // Tiempo real: cada pedido nuevo se encola al final
    this.canal = this.pedidos.escuchar('restaurante_id=eq.' + restaurante.id, (payload) => {
      if (payload.eventType === 'INSERT') {
        this.encolarNuevo(payload.new.id);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.canal) {
      this.pedidos.dejarDeEscuchar(this.canal);
    }
  }

  private refrescarCola(): void {
    this.pendientes.set([...this.cola.items]);
    this.siguiente.set(this.cola.peek() ?? null);
  }

  private async encolarNuevo(id: number): Promise<void> {
    // Los items se insertan justo después del pedido; se espera un momento antes de leerlos
    await new Promise(resolver => setTimeout(resolver, 800));
    const { data } = await this.pedidos.obtener(id);
    if (data) {
      this.cola.enqueue(data);
      this.refrescarCola();
    }
  }

  async tomarSiguiente(): Promise<void> {
    const pedido = this.cola.peek();
    if (!pedido) {
      this.mensaje.set('No hay pedidos en espera. Aprovecha y lava los platos.');
      return;
    }

    const { error } = await this.pedidos.actualizar(pedido.id, 'en_cocina', 0);
    if (error) {
      this.mensaje.set('No se pudo tomar el pedido: ' + error.message);
      return;
    }

    this.cola.dequeue();
    pedido.estado = 'en_cocina';
    this.enCurso.update(lista => [...lista, pedido]);
    this.refrescarCola();
    this.mensaje.set('');
  }

  textoBoton(pedido: Pedido): string {
    if (pedido.estado === 'en_cocina') return 'Despachar';
    return pedido.progreso >= 75 ? 'Marcar entregado' : 'Avanzar domiciliario';
  }

  // en_cocina -> en_camino (0%) -> +25% ... -> 100% = entregado
  async avanzar(pedido: Pedido): Promise<void> {
    let estado = pedido.estado;
    let progreso = pedido.progreso;

    if (estado === 'en_cocina') {
      estado = 'en_camino';
      progreso = 0;
    } else {
      progreso = progreso + 25;
      if (progreso >= 100) {
        estado = 'entregado';
        progreso = 100;
      }
    }

    const { error } = await this.pedidos.actualizar(pedido.id, estado, progreso);
    if (error) {
      this.mensaje.set('No se pudo actualizar el pedido: ' + error.message);
      return;
    }

    if (estado === 'entregado') {
      const errorTop = await this.pedidos.sumarVecesPedido(pedido.pedido_items ?? []);
      this.mensaje.set(errorTop === '' ? 'Pedido #' + pedido.id + ' entregado. ¡Otro cliente feliz!' : errorTop);
      this.enCurso.update(lista => lista.filter(p => p.id !== pedido.id));
      return;
    }

    this.enCurso.update(lista => lista.map(p => p.id === pedido.id ? { ...p, estado: estado, progreso: progreso } : p));
  }
}
