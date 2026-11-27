import { Injectable, signal } from '@angular/core';
import { Ubicacion } from '../models/ubicacion';

@Injectable({
  providedIn: 'root',
})
export class Mapa {
  private urlNominatim = 'https://nominatim.openstreetmap.org/search';
  private controlador: AbortController | null = null;

  cargando = signal(false);
  error = signal('');

  // Igual al servicio con fetch del Challenge 13.
  // Política de Nominatim: máximo 1 petición por segundo y nunca mientras se escribe,
  // por eso solo se llama con el botón "Buscar".
  async geocodificar(direccion: string): Promise<Ubicacion | null> {
    this.controlador?.abort();
    this.error.set('');

    const q = direccion.trim();
    if (q === '') {
      this.error.set('Escribe una dirección.');
      return null;
    }

    const controlador = new AbortController();
    this.controlador = controlador;
    this.cargando.set(true);

    try {
      const params = new URLSearchParams({
        q: q + ', Cali, Colombia',
        format: 'json',
        limit: '1',
        countrycodes: 'co',
      });
      const res = await fetch(`${this.urlNominatim}?${params}`, { signal: controlador.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const respuesta: Ubicacion[] = await res.json();
      if (respuesta.length === 0) {
        this.error.set('No encontramos esa dirección. Prueba con calle y número, ej: Calle 5 # 38-20.');
        return null;
      }
      return respuesta[0];
    } catch (e) {
      const error = e as Error;
      if (error.name === 'AbortError') return null;
      this.error.set('El mapa se fue a almorzar. Intenta otra vez. (' + error.message + ')');
      return null;
    } finally {
      if (this.controlador === controlador) this.cargando.set(false);
    }
  }
}
