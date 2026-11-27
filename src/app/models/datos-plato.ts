// Lo que envía el formulario de platos al panel
export interface DatosPlato {
  id: number | null;
  categoria_id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  archivo: File | null;
}
