import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Restaurante } from '../../models/restaurante';
import { Catalogo } from '../../services/catalogo';

@Component({
  selector: 'app-tarjeta-restaurante',
  imports: [RouterLink],
  templateUrl: './tarjeta-restaurante.html',
  styleUrl: './tarjeta-restaurante.scss',
})
export class TarjetaRestaurante {
  @Input() restaurante!: Restaurante;
  @Input() entrega = true;

  catalogo = inject(Catalogo);
}
