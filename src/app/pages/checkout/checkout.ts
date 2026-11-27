import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { Barrios } from '../../services/barrios';
import { Carrito } from '../../services/carrito';
import { Catalogo } from '../../services/catalogo';
import { Mapa } from '../../services/mapa';
import { Pedidos } from '../../services/pedidos';
import { Barrio } from '../../models/barrio';
import { Restaurante } from '../../models/restaurante';
import { Ubicacion } from '../../models/ubicacion';
import { Grafo } from '../../models/grafo';

@Component({
  selector: 'app-checkout',
  imports: [FormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout {
  private auth = inject(Auth);
  private barriosServicio = inject(Barrios);
  private pedidos = inject(Pedidos);
  private router = inject(Router);
  carrito = inject(Carrito);
  catalogo = inject(Catalogo);
  mapa = inject(Mapa);

  restaurante = signal<Restaurante | null>(null);
  barriosPermitidos = signal<Barrio[]>([]);
  barrioId = signal(0);
  direccion = signal('');
  ubicacion = signal<Ubicacion | null>(null);
  mensaje = signal('');
  enviando = signal(false);

  private datosCargados = false;

  constructor() {
    // Si se entra directo o se recarga, el carrito todavía se está cargando desde Supabase:
    // cuando lleguen los ítems se cargan los datos del pedido (igual que Inicio espera al perfil)
    effect(() => {
      const items = this.carrito.items();
      const restauranteId = this.carrito.restauranteId();
      if (items.length > 0 && restauranteId !== null && !this.datosCargados) {
        this.datosCargados = true;
        this.cargarDatos(restauranteId);
      }
    });
  }

  async cargarDatos(restauranteId: number): Promise<void> {
    const [restaurante, barrios, vecinos] = await Promise.all([
      this.catalogo.obtenerRestaurante(restauranteId),
      this.barriosServicio.listar(),
      this.catalogo.listarVecinos(),
    ]);

    if (!restaurante.data || barrios.error || vecinos.error) {
      this.mensaje.set('No pudimos cargar los datos del pedido.');
      return;
    }

    this.restaurante.set(restaurante.data);

    // El grafo dice a qué barrios entrega este restaurante
    const grafo = new Grafo();
    for (let barrio of barrios.data) grafo.addNode(barrio);
    for (let arista of vecinos.data) grafo.addEdge(String(arista.barrio_a), String(arista.barrio_b));

    const cobertura = grafo.barriosConCobertura(String(restaurante.data.barrio_id));
    const permitidos = (barrios.data as Barrio[]).filter(b => cobertura.includes(String(b.id)));
    this.barriosPermitidos.set(permitidos);

    const miBarrio = this.auth.perfil()?.barrio_id;
    if (miBarrio && permitidos.some(b => b.id === miBarrio)) {
      this.barrioId.set(miBarrio);
    }
  }

  async buscarDireccion(): Promise<void> {
    this.ubicacion.set(await this.mapa.geocodificar(this.direccion()));
  }

  cambiarDireccion(texto: string): void {
    this.direccion.set(texto);
    // Si cambia la dirección, hay que volver a buscarla
    this.ubicacion.set(null);
  }

  validar(): string {
    if (this.barrioId() === 0) return 'Elige el barrio de entrega.';
    if (this.direccion().trim() === '') return 'Escribe la dirección.';
    if (!this.ubicacion()) return 'Busca la dirección en el mapa antes de confirmar.';
    return '';
  }

  async confirmar(): Promise<void> {
    const error = this.validar();
    this.mensaje.set(error);
    const restaurante = this.restaurante();
    const ubicacion = this.ubicacion();
    const perfil = this.auth.perfil();

    if (error !== '' || !restaurante || !ubicacion || !perfil) {
      return;
    }

    this.enviando.set(true);

    const resultado = await this.pedidos.crear({
      clienteId: perfil.id,
      restauranteId: restaurante.id,
      barrioId: this.barrioId(),
      direccion: this.direccion().trim(),
      lat: Number(ubicacion.lat),
      lng: Number(ubicacion.lon),
      total: this.carrito.total(),
    }, this.carrito.items());

    if (resultado.error !== '') {
      this.mensaje.set('No pudimos crear el pedido: ' + resultado.error);
      this.enviando.set(false);
      return;
    }

    await this.carrito.vaciar();
    this.enviando.set(false);
    await this.router.navigate(['/pedidos', resultado.id]);
  }
}
