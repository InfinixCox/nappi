import { Component, OnInit, inject, signal } from '@angular/core';
import { Auth } from '../../services/auth';
import { Catalogo } from '../../services/catalogo';
import { Pedidos } from '../../services/pedidos';
import { Restaurante } from '../../models/restaurante';
import { Categoria } from '../../models/categoria';
import { Plato } from '../../models/plato';
import { DatosPlato } from '../../models/datos-plato';
import { ArbolMenu } from '../../models/arbol-menu';
import { NodoMenu } from '../../models/nodo-menu';
import { FormCategoria } from '../../components/form-categoria/form-categoria';
import { FormPlato } from '../../components/form-plato/form-plato';

@Component({
  selector: 'app-panel-menu',
  imports: [FormCategoria, FormPlato],
  templateUrl: './panel-menu.html',
  styleUrl: './panel-menu.scss',
})
export class PanelMenu implements OnInit {
  private auth = inject(Auth);
  private pedidos = inject(Pedidos);
  catalogo = inject(Catalogo);

  restaurante = signal<Restaurante | null>(null);
  categorias = signal<Categoria[]>([]);
  arbol = signal<ArbolMenu | null>(null);
  editando = signal<Plato | null>(null);
  guardando = signal(false);
  mensaje = signal('');
  tipoMensaje = signal<'error' | 'exito'>('exito');

  async ngOnInit(): Promise<void> {
    const { data: sesion } = await this.auth.obtenerSesion();
    const { data } = await this.pedidos.obtenerMiRestaurante(sesion.session?.user.id ?? '');

    if (!data) {
      this.avisar('Esta cuenta no tiene un restaurante asignado.', 'error');
      return;
    }

    this.restaurante.set(data);
    await this.recargar();
  }

  async recargar(): Promise<void> {
    const restaurante = this.restaurante();
    if (!restaurante) return;

    const [categorias, platos] = await Promise.all([
      this.catalogo.listarCategorias(restaurante.id),
      this.catalogo.listarPlatosPanel(restaurante.id),
    ]);

    this.categorias.set(categorias.data ?? []);
    this.arbol.set(new ArbolMenu(categorias.data ?? [], platos.data ?? []));
  }

  principales(): Categoria[] {
    return this.categorias().filter(c => c.padre_id === null);
  }

  nodosEnOrden(): { nodo: NodoMenu; nivel: number }[] {
    const lista: { nodo: NodoMenu; nivel: number }[] = [];
    const recorrer = (nodo: NodoMenu, nivel: number) => {
      for (let hijo of nodo.hijos) {
        lista.push({ nodo: hijo, nivel: nivel });
        recorrer(hijo, nivel + 1);
      }
    };
    const arbol = this.arbol();
    if (arbol) recorrer(arbol.raiz, 1);
    return lista;
  }

  private avisar(texto: string, tipo: 'error' | 'exito'): void {
    this.tipoMensaje.set(tipo);
    this.mensaje.set(texto);
  }

  async crearCategoria(datos: { nombre: string; padreId: number | null }): Promise<void> {
    const restaurante = this.restaurante();
    if (!restaurante) return;

    const { error } = await this.catalogo.crearCategoria(restaurante.id, datos.nombre, datos.padreId);
    if (error) {
      this.avisar('No se pudo crear la categoría: ' + error.message, 'error');
      return;
    }

    this.avisar('Categoría "' + datos.nombre + '" creada.', 'exito');
    await this.recargar();
  }

  async guardarPlato(datos: DatosPlato): Promise<void> {
    const restaurante = this.restaurante();
    if (!restaurante) return;

    this.guardando.set(true);
    let imagen = '';

    if (datos.archivo) {
      const subida = await this.catalogo.subirImagen(restaurante.slug, datos.archivo);
      if (subida.error !== '') {
        this.avisar('No se pudo subir la foto: ' + subida.error, 'error');
        this.guardando.set(false);
        return;
      }
      imagen = subida.ruta;
    }

    const cambios = {
      categoria_id: datos.categoria_id,
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      precio: datos.precio,
    };

    const { error } = datos.id === null
      ? await this.catalogo.crearPlato({ ...cambios, restaurante_id: restaurante.id, imagen_path: imagen })
      : await this.catalogo.actualizarPlato(datos.id, imagen !== '' ? { ...cambios, imagen_path: imagen } : cambios);

    this.guardando.set(false);

    if (error) {
      this.avisar('No se pudo guardar el plato: ' + error.message, 'error');
      return;
    }

    this.avisar('Plato "' + datos.nombre + '" guardado.', 'exito');
    this.editando.set(null);
    await this.recargar();
  }

  async cambiarDisponible(plato: Plato): Promise<void> {
    const { error } = await this.catalogo.actualizarPlato(plato.id, { disponible: !plato.disponible });
    if (error) {
      this.avisar('No se pudo cambiar la disponibilidad: ' + error.message, 'error');
      return;
    }
    await this.recargar();
  }
}
