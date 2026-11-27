import { Component, EventEmitter, Input, Output, effect, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Categoria } from '../../models/categoria';
import { Plato } from '../../models/plato';
import { DatosPlato } from '../../models/datos-plato';

@Component({
  selector: 'app-form-plato',
  imports: [FormsModule],
  templateUrl: './form-plato.html',
  styleUrl: './form-plato.scss',
})
export class FormPlato {
  @Input() categorias: Categoria[] = [];
  @Input() guardando = false;
  editar = input<Plato | null>(null);
  @Output() guardar = new EventEmitter<DatosPlato>();
  @Output() cancelar = new EventEmitter<void>();

  nombre = signal('');
  descripcion = signal('');
  precio = signal<number | null>(null);
  categoriaId = signal(0);
  archivo = signal<File | null>(null);
  mensaje = signal('');

  constructor() {
    effect(() => {
      const plato = this.editar();
      this.nombre.set(plato ? plato.nombre : '');
      this.descripcion.set(plato ? plato.descripcion : '');
      this.precio.set(plato ? plato.precio : null);
      this.categoriaId.set(plato ? plato.categoria_id : 0);
      this.archivo.set(null);
      this.mensaje.set('');
    });
  }

  elegirArchivo(evento: any): void {
    this.archivo.set(evento.target.files[0] ?? null);
  }

  enviar(): void {
    const precio = this.precio();

    if (this.nombre().trim() === '' || this.categoriaId() === 0 || precio === null) {
      this.mensaje.set('Completa nombre, categoría y precio.');
      return;
    }

    if (precio <= 0) {
      this.mensaje.set('El precio debe ser mayor que cero. Aquí nada es gratis (salvo la ñapa).');
      return;
    }

    if (!this.editar() && !this.archivo()) {
      this.mensaje.set('Sube una foto del plato: la comida entra por los ojos.');
      return;
    }

    this.mensaje.set('');
    this.guardar.emit({
      id: this.editar()?.id ?? null,
      categoria_id: this.categoriaId(),
      nombre: this.nombre().trim(),
      descripcion: this.descripcion().trim(),
      precio: precio,
      archivo: this.archivo(),
    });
  }
}
