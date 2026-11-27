import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Plato } from '../../models/plato';
import { Catalogo } from '../../services/catalogo';

@Component({
  selector: 'app-top-platos',
  imports: [RouterLink],
  templateUrl: './top-platos.html',
  styleUrl: './top-platos.scss',
})
export class TopPlatos {
  @Input() platos: Plato[] = [];

  catalogo = inject(Catalogo);
}
