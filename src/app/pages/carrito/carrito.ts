import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Carrito as CarritoServicio } from '../../services/carrito';
import { Catalogo } from '../../services/catalogo';

@Component({
  selector: 'app-carrito',
  imports: [RouterLink],
  templateUrl: './carrito.html',
  styleUrl: './carrito.scss',
})
export class Carrito {
  carrito = inject(CarritoServicio);
  catalogo = inject(Catalogo);

  mensaje = signal('');

  async cambiar(platoId: number, nueva: number): Promise<void> {
    this.mensaje.set(await this.carrito.cambiarCantidad(platoId, nueva));
  }

  async quitar(platoId: number): Promise<void> {
    this.mensaje.set(await this.carrito.quitar(platoId));
  }

  async deshacer(): Promise<void> {
    this.mensaje.set(await this.carrito.deshacer());
  }
}
