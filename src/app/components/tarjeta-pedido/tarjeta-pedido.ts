import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Pedido } from '../../models/pedido';
import { Catalogo } from '../../services/catalogo';

@Component({
  selector: 'app-tarjeta-pedido',
  imports: [DatePipe],
  templateUrl: './tarjeta-pedido.html',
  styleUrl: './tarjeta-pedido.scss',
})
export class TarjetaPedido {
  @Input() pedido!: Pedido;
  @Input() textoBoton = '';
  @Output() accion = new EventEmitter<Pedido>();

  catalogo = inject(Catalogo);
}
