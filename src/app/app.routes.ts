import { Routes } from '@angular/router';
import { Inicio } from './pages/inicio/inicio';
import { Login } from './pages/login/login';
import { Registro } from './pages/registro/registro';
import { MisPedidos } from './pages/mis-pedidos/mis-pedidos';
import { Panel } from './pages/panel/panel';
import { NoEncontrado } from './pages/no-encontrado/no-encontrado';
import { clienteGuard } from './guards/cliente-guard';
import { restauranteGuard } from './guards/restaurante-guard';
import { invitadoGuard } from './guards/invitado-guard';

export const routes: Routes = [
  { path: '', component: Inicio },
  { path: 'login', component: Login, canActivate: [invitadoGuard] },
  { path: 'registro', component: Registro, canActivate: [invitadoGuard] },
  { path: 'pedidos', component: MisPedidos, canActivate: [clienteGuard] },
  { path: 'panel', component: Panel, canActivate: [restauranteGuard] },
  { path: '**', component: NoEncontrado }
];
