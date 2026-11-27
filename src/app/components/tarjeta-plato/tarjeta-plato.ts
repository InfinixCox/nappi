import { Component, Input, inject } from '@angular/core';
import { Plato } from '../../models/plato';
import { Catalogo } from '../../services/catalogo';

@Component({
  selector: 'app-tarjeta-plato',
  imports: [],
  templateUrl: './tarjeta-plato.html',
  styleUrl: './tarjeta-plato.scss',
})
export class TarjetaPlato {
  @Input() plato!: Plato;

  catalogo = inject(Catalogo);
}
