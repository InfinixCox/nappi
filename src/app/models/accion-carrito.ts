import { Plato } from './plato';

// Lo que se apila para poder deshacer
export interface AccionCarrito {
  tipo: 'agregar' | 'quitar' | 'cantidad';
  plato: Plato;
  cantidadAnterior: number;
}
