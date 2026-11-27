import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

// Rutas solo para cuentas de restaurante (panel)
export const restauranteGuard: CanActivateFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router);

  const rol = await auth.obtenerRol();

  if (rol === 'restaurante') {
    return true;
  }

  if (rol === 'cliente') {
    return router.createUrlTree(['/']);
  }

  return router.createUrlTree(['/login']);
};
