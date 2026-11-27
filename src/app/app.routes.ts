import { Routes } from '@angular/router';
import { Inicio } from './pages/inicio/inicio';
import { Restaurante } from './pages/restaurante/restaurante';
import { Cobertura } from './pages/cobertura/cobertura';
import { Seguimiento } from './pages/seguimiento/seguimiento';
import { Login } from './pages/login/login';
import { Registro } from './pages/registro/registro';
import { MisPedidos } from './pages/mis-pedidos/mis-pedidos';
import { Carrito } from './pages/carrito/carrito';
import { Checkout } from './pages/checkout/checkout';
import { Panel } from './pages/panel/panel';
import { PanelPedidos } from './pages/panel-pedidos/panel-pedidos';
import { PanelMenu } from './pages/panel-menu/panel-menu';
import { NoEncontrado } from './pages/no-encontrado/no-encontrado';
import { Perfil } from './pages/perfil/perfil';
import { clienteGuard } from './guards/cliente-guard';
import { restauranteGuard } from './guards/restaurante-guard';
import { invitadoGuard } from './guards/invitado-guard';

export const routes: Routes = [
  { path: '', component: Inicio },
  { path: 'restaurante/:id', component: Restaurante },
  { path: 'cobertura', component: Cobertura },
  { path: 'login', component: Login, canActivate: [invitadoGuard] },
  { path: 'registro', component: Registro, canActivate: [invitadoGuard] },
  { path: 'carrito', component: Carrito, canActivate: [clienteGuard] },
  { path: 'checkout', component: Checkout, canActivate: [clienteGuard] },
  { path: 'pedidos', component: MisPedidos, canActivate: [clienteGuard] },
  { path: 'pedidos/:id', component: Seguimiento, canActivate: [clienteGuard] },
  { path: 'perfil', component: Perfil, canActivate: [clienteGuard] },
  {
    path: 'panel',
    component: Panel,
    canActivate: [restauranteGuard],
    children: [
      { path: '', redirectTo: 'pedidos', pathMatch: 'full' },
      { path: 'pedidos', component: PanelPedidos },
      { path: 'menu', component: PanelMenu },
    ],
  },
  { path: '**', component: NoEncontrado }
];
