import { Component, Input } from '@angular/core';
import { NodoMenu } from '../../models/nodo-menu';
import { TarjetaPlato } from '../tarjeta-plato/tarjeta-plato';

@Component({
  selector: 'app-nodo-menu-vista',
  imports: [TarjetaPlato],
  templateUrl: './nodo-menu-vista.html',
  styleUrl: './nodo-menu-vista.scss',
})
export class NodoMenuVista {
  @Input() nodo!: NodoMenu;
  @Input() nivel = 1;
}
