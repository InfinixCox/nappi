import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ResultadoBusqueda } from '../../models/resultado-busqueda';

@Component({
  selector: 'app-buscador',
  imports: [RouterLink],
  templateUrl: './buscador.html',
  styleUrl: './buscador.scss',
})
export class Buscador {
  @Input() resultados: ResultadoBusqueda[] = [];
  @Input() texto = '';
  @Output() buscar = new EventEmitter<string>();
}
