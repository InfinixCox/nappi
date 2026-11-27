import { Component, OnInit, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Catalogo } from '../../services/catalogo';
import { Restaurante as RestauranteModelo } from '../../models/restaurante';
import { Plato } from '../../models/plato';
import { ArbolMenu } from '../../models/arbol-menu';
import { ArbolPrecios } from '../../models/arbol-precios';
import { NodoMenuVista } from '../../components/nodo-menu-vista/nodo-menu-vista';
import { FiltroPrecio } from '../../components/filtro-precio/filtro-precio';
import { TarjetaPlato } from '../../components/tarjeta-plato/tarjeta-plato';

@Component({
  selector: 'app-restaurante',
  imports: [RouterLink, NodoMenuVista, FiltroPrecio, TarjetaPlato],
  templateUrl: './restaurante.html',
  styleUrl: './restaurante.scss',
})
export class Restaurante implements OnInit {
  // /ruta/2 -> id() = '2' (rutas dinámicas con input(), Clase 8)
  id = input<string>();
  catalogo = inject(Catalogo);

  private arbolPrecios = new ArbolPrecios();

  restaurante = signal<RestauranteModelo | null>(null);
  arbol = signal<ArbolMenu | null>(null);
  filtrados = signal<Plato[] | null>(null);
  rangoTexto = signal('');
  cargando = signal(true);
  mensaje = signal('');

  async ngOnInit(): Promise<void> {
    const id = Number(this.id());

    const [restaurante, categorias, platos] = await Promise.all([
      this.catalogo.obtenerRestaurante(id),
      this.catalogo.listarCategorias(id),
      this.catalogo.listarPlatos(id),
    ]);

    if (restaurante.error || categorias.error || platos.error || !restaurante.data) {
      this.mensaje.set('Este restaurante no existe o se fue a almorzar.');
      this.cargando.set(false);
      return;
    }

    this.restaurante.set(restaurante.data);
    this.arbol.set(new ArbolMenu(categorias.data, platos.data));

    for (let plato of platos.data as Plato[]) {
      this.arbolPrecios.insertar(plato);
    }

    this.cargando.set(false);
  }

  aplicarFiltro(rango: { min: number; max: number }): void {
    this.filtrados.set(this.arbolPrecios.rango(rango.min, rango.max));
    this.rangoTexto.set(this.catalogo.formatoPrecio(rango.min) + ' y ' + this.catalogo.formatoPrecio(rango.max));
  }

  quitarFiltro(): void {
    this.filtrados.set(null);
  }
}
