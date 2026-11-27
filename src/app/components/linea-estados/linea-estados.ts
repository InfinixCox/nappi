import { Component, Input } from '@angular/core';
import { EstadoPedido } from '../../models/pedido';

@Component({
  selector: 'app-linea-estados',
  imports: [],
  templateUrl: './linea-estados.html',
  styleUrl: './linea-estados.scss',
})
export class LineaEstados {
  @Input() estado: EstadoPedido = 'pendiente';

  pasos: { estado: EstadoPedido; texto: string }[] = [
    { estado: 'pendiente', texto: 'Recibido' },
    { estado: 'en_cocina', texto: 'En cocina' },
    { estado: 'en_camino', texto: 'En camino' },
    { estado: 'entregado', texto: 'Entregado' },
  ];

  completado(paso: EstadoPedido): boolean {
    const orden = this.pasos.map(p => p.estado);
    return orden.indexOf(paso) <= orden.indexOf(this.estado);
  }
}
