export interface Perfil {
  id: string;
  nombre: string;
  rol: 'cliente' | 'restaurante';
  barrio_id: number | null;
}
