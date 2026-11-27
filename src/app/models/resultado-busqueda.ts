export interface ResultadoBusqueda {
  tipo: 'plato' | 'restaurante';
  texto: string;
  detalle: string;
  restauranteId: number;
}
