export interface Restaurante {
  id: number;
  slug: string;
  nombre: string;
  tipo: string;
  eslogan: string;
  napa: string;
  barrio_id: number;
  lat: number;
  lng: number;
  portada_path: string;
  logo_path: string;
  tiempo_min: number;
}
