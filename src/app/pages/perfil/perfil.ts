import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';
import { Barrios } from '../../services/barrios';
import { Barrio } from '../../models/barrio';

@Component({
  selector: 'app-perfil',
  imports: [FormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
})
export class Perfil implements OnInit {
  auth = inject(Auth);
  private barriosServicio = inject(Barrios);

  barrios = signal<Barrio[]>([]);
  nombre = signal('');
  barrioId = signal(0);
  mensaje = signal('');
  tipoMensaje = signal<'error' | 'exito'>('error');
  pendiente = signal(false);

  // Para llenar el formulario una sola vez y no borrar lo que el usuario escribe
  private formularioLleno = false;

  constructor() {
    // Igual que en Inicio: el perfil puede llegar después de abrir la página
    effect(() => {
      const perfil = this.auth.perfil();
      if (perfil && !this.formularioLleno) {
        this.nombre.set(perfil.nombre);
        this.barrioId.set(perfil.barrio_id ?? 0);
        this.formularioLleno = true;
      }
    });
  }

  async ngOnInit(): Promise<void> {
    const { data } = await this.barriosServicio.listar();
    this.barrios.set(data ?? []);
  }

  validar(): string {
    if (!this.auth.perfil()) {
      return 'Espera un momento, todavía estamos cargando tu perfil.';
    }

    if (this.nombre().trim() === '') {
      return 'Escribe tu nombre, el domiciliario necesita saber a quién saludar.';
    }

    if (this.barrioId() === 0) {
      return 'Elige tu barrio para saber qué restaurantes te entregan.';
    }

    return '';
  }

  async guardar(): Promise<void> {
    const error = this.validar();
    this.tipoMensaje.set('error');
    this.mensaje.set(error);

    if (error !== '') {
      return;
    }

    this.pendiente.set(true);

    const id = this.auth.perfil()!.id;
    const { error: errorGuardar } = await this.auth.actualizarPerfil(id, this.nombre().trim(), this.barrioId());

    if (errorGuardar) {
      this.mensaje.set('No pudimos guardar tus cambios: ' + errorGuardar.message);
      this.pendiente.set(false);
      return;
    }

    // Así la barra y el Inicio ven el nombre y el barrio nuevos sin recargar
    await this.auth.cargarPerfil();

    this.tipoMensaje.set('exito');
    this.mensaje.set('Listo. Ahora los domicilios saben dónde encontrarte.');
    this.pendiente.set(false);
  }
}
