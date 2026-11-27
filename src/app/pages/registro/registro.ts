import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { Barrios } from '../../services/barrios';
import { Barrio } from '../../models/barrio';

@Component({
  selector: 'app-registro',
  imports: [FormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class Registro implements OnInit {
  private auth = inject(Auth);
  private barriosServicio = inject(Barrios);
  private router = inject(Router);

  barrios = signal<Barrio[]>([]);
  nombre = signal('');
  barrioId = signal(0);
  email = signal('');
  clave = signal('');
  confirmar = signal('');
  mensaje = signal('');
  pendiente = signal(false);
  verClave = signal(false);

  async ngOnInit(): Promise<void> {
    const { data } = await this.barriosServicio.listar();
    this.barrios.set(data ?? []);
  }

  alternarClave(): void {
    this.verClave.set(!this.verClave());
  }

  validar(): string {
    if (this.nombre().trim() === '' || this.email() === '' || this.clave() === '' || this.confirmar() === '') {
      return 'Completa todos los campos.';
    }

    if (this.barrioId() === 0) {
      return 'Elige tu barrio para saber qué restaurantes te entregan.';
    }

    if (this.clave().length < 6) {
      return 'La contraseña debe tener mínimo 6 caracteres.';
    }

    if (this.clave() !== this.confirmar()) {
      return 'Las contraseñas no coinciden.';
    }

    return '';
  }

  async registrar(): Promise<void> {
    const error = this.validar();
    this.mensaje.set(error);

    if (error !== '') {
      return;
    }

    this.pendiente.set(true);

    const { data, error: errorRegistro } = await this.auth.registrar(this.email(), this.clave());

    if (errorRegistro || !data.user) {
      this.mensaje.set(this.traducirError(errorRegistro ? errorRegistro.message : 'No se pudo crear la cuenta.'));
      this.pendiente.set(false);
      return;
    }

    const { error: errorPerfil } = await this.auth.crearPerfil(data.user.id, this.nombre().trim(), this.barrioId());

    if (errorPerfil) {
      this.mensaje.set('La cuenta se creó, pero no se pudo guardar el perfil: ' + errorPerfil.message);
      this.pendiente.set(false);
      return;
    }

    await this.auth.cargarPerfil();
    await this.router.navigate(['/']);
    this.pendiente.set(false);
  }

  traducirError(mensaje: string): string {
    if (mensaje === 'User already registered') {
      return 'Ese correo ya está registrado.';
    }

    return mensaje;
  }
}
