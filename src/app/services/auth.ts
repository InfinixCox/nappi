import { Injectable, inject, signal } from '@angular/core';
import { Session } from '@supabase/supabase-js';
import { Supabase } from './supabase';
import { Perfil } from '../models/perfil';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private sb = inject(Supabase).client;

  session = signal<Session | null>(null);
  perfil = signal<Perfil | null>(null);

  constructor() {
    this.sb.auth.getSession().then(({ data }) => {
      this.session.set(data.session);
      this.cargarPerfil();
    });

    this.sb.auth.onAuthStateChange((_evento, s) => {
      this.session.set(s);
      // Supabase recomienda no hacer consultas dentro de este callback,
      // por eso el perfil se carga justo después con setTimeout.
      setTimeout(() => this.cargarPerfil(), 0);
    });
  }

  async cargarPerfil(): Promise<void> {
    const sesion = this.session();

    if (!sesion) {
      this.perfil.set(null);
      return;
    }

    const { data } = await this.sb
      .from('profiles')
      .select('*')
      .eq('id', sesion.user.id)
      .maybeSingle();

    this.perfil.set(data);
  }

  // Lo usan los guards: consulta el rol directamente en la base de datos
  async obtenerRol(): Promise<'cliente' | 'restaurante' | null> {
    const { data } = await this.sb.auth.getSession();

    if (!data.session) {
      return null;
    }

    const respuesta = await this.sb
      .from('profiles')
      .select('rol')
      .eq('id', data.session.user.id)
      .maybeSingle();

    return respuesta.data ? respuesta.data.rol : null;
  }

  obtenerSesion() {
    return this.sb.auth.getSession();
  }

  registrar(email: string, clave: string) {
    return this.sb.auth.signUp({ email: email, password: clave });
  }

  crearPerfil(id: string, nombre: string, barrioId: number) {
    return this.sb.from('profiles').insert({ id: id, nombre: nombre, barrio_id: barrioId });
  }

  // Lo usa Mi perfil; las políticas RLS no dejan cambiar el rol
  actualizarPerfil(id: string, nombre: string, barrioId: number) {
    return this.sb.from('profiles').update({ nombre: nombre, barrio_id: barrioId }).eq('id', id);
  }

  entrar(email: string, clave: string) {
    return this.sb.auth.signInWithPassword({ email: email, password: clave });
  }

  salir() {
    return this.sb.auth.signOut();
  }
}
