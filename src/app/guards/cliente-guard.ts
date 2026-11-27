import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

// Rutas solo para clientes (carrito, checkout, pedidos)
export const clienteGuard: CanActivateFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router);

  const rol = await auth.obtenerRol();

  if (rol === 'cliente') {
    return true;
  }

  if (rol === 'restaurante') {
    return router.createUrlTree(['/panel']);
  }

  return router.createUrlTree(['/login']);
};
