import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

// Login y registro: si ya hay sesión, manda a cada quien a su página
export const invitadoGuard: CanActivateFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router);

  const rol = await auth.obtenerRol();

  if (rol === 'restaurante') {
    return router.createUrlTree(['/panel']);
  }

  if (rol === 'cliente') {
    return router.createUrlTree(['/']);
  }

  return true;
};
