import { Injectable, signal } from '@angular/core';
import { Ubicacion } from '../models/ubicacion';

@Injectable({
  providedIn: 'root',
})
export class Mapa {
  private urlNominatim = 'https://nominatim.openstreetmap.org/search';
  private urlOsrm = 'https://router.project-osrm.org/route/v1/driving';
  private controlador: AbortController | null = null;

  cargando = signal(false);
  error = signal('');

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

  async ruta(origen: [number, number], destino: [number, number]): Promise<[number, number][]> {
    try {
      const coordenadas = `${origen[1]},${origen[0]};${destino[1]},${destino[0]}`;
      const params = new URLSearchParams({ overview: 'full', geometries: 'geojson' });
      const res = await fetch(`${this.urlOsrm}/${coordenadas}?${params}`, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const respuesta = await res.json();
      if (!respuesta.routes || respuesta.routes.length === 0) {
        return [origen, destino];
      }
      return respuesta.routes[0].geometry.coordinates.map((p: number[]) => [p[1], p[0]] as [number, number]);
    } catch {
      return [origen, destino];
    }
  }
}
