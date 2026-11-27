import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Categoria } from '../../models/categoria';

@Component({
  selector: 'app-form-categoria',
  imports: [FormsModule],
  templateUrl: './form-categoria.html',
  styleUrl: './form-categoria.scss',
})
export class FormCategoria {
  @Input() principales: Categoria[] = [];
  @Output() crear = new EventEmitter<{ nombre: string; padreId: number | null }>();

  nombre = signal('');
  padreId = signal(0);
  mensaje = signal('');

  enviar(): void {
    if (this.nombre().trim() === '') {
      this.mensaje.set('Escribe el nombre de la categoría.');
      return;
    }

    this.mensaje.set('');
    this.crear.emit({ nombre: this.nombre().trim(), padreId: this.padreId() === 0 ? null : this.padreId() });
    this.nombre.set('');
    this.padreId.set(0);
  }
}
