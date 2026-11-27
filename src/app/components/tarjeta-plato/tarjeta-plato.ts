import { Component, Input, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Plato } from '../../models/plato';
import { Catalogo } from '../../services/catalogo';
import { Carrito } from '../../services/carrito';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-tarjeta-plato',
  imports: [],
  templateUrl: './tarjeta-plato.html',
  styleUrl: './tarjeta-plato.scss',
})
export class TarjetaPlato {
  @Input() plato!: Plato;

  catalogo = inject(Catalogo);
  auth = inject(Auth);
  private carrito = inject(Carrito);
  private router = inject(Router);

  mensaje = signal('');

  async agregar(): Promise<void> {
    if (!this.auth.session()) {
      await this.router.navigate(['/login']);
      return;
    }

    // El carrito solo admite platos de un restaurante, como en las apps reales
    const actual = this.carrito.restauranteId();
    if (actual !== null && actual !== this.plato.restaurante_id) {
      if (!confirm('Tu carrito tiene platos de otro restaurante. ¿Lo vaciamos y empezamos aquí?')) {
        return;
      }
      const errorVaciar = await this.carrito.vaciar();
      if (errorVaciar !== '') {
        this.mensaje.set(errorVaciar);
        return;
      }
    }

    const error = await this.carrito.agregar(this.plato);
    this.mensaje.set(error === '' ? '¡Al carrito!' : error);
  }
}
