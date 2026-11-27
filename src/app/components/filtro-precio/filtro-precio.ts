import { Component, EventEmitter, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filtro-precio',
  imports: [FormsModule],
  templateUrl: './filtro-precio.html',
  styleUrl: './filtro-precio.scss',
})
export class FiltroPrecio {
  @Output() filtrar = new EventEmitter<{ min: number; max: number }>();
  @Output() limpiar = new EventEmitter<void>();

  min = signal<number | null>(null);
  max = signal<number | null>(null);
  mensaje = signal('');

  aplicar(): void {
    const min = this.min() ?? 0;
    const max = this.max() ?? 1000000;

    if (min < 0 || max < 0) {
      this.mensaje.set('Los precios no pueden ser negativos.');
      return;
    }

    if (min > max) {
      this.mensaje.set('El mínimo no puede ser mayor que el máximo.');
      return;
    }

    this.mensaje.set('');
    this.filtrar.emit({ min: min, max: max });
  }

  quitar(): void {
    this.min.set(null);
    this.max.set(null);
    this.mensaje.set('');
    this.limpiar.emit();
  }
}
