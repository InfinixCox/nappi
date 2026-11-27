import { Plato } from './plato';

export interface AccionCarrito {
  tipo: 'agregar' | 'quitar' | 'cantidad';
  plato: Plato;
  cantidadAnterior: number;
}
