import { Injectable, inject } from '@angular/core';
import { Supabase } from './supabase';

@Injectable({
  providedIn: 'root',
})
export class Barrios {
  private sb = inject(Supabase).client;

  listar() {
    return this.sb.from('barrios').select('*').order('nombre');
  }
}
