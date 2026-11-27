import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Pedidos } from '../../services/pedidos';
import { Pedido } from '../../models/pedido';

@Component({
  selector: 'app-mis-pedidos',
  imports: [DatePipe],
  templateUrl: './mis-pedidos.html',
  styleUrl: './mis-pedidos.scss',
})
export class MisPedidos implements OnInit {
  private pedidosServicio = inject(Pedidos);

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
