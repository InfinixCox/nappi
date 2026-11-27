export interface Categoria {
  id: number;
  restaurante_id: number;
  padre_id: number | null;
  nombre: string;
  orden: number;
}
