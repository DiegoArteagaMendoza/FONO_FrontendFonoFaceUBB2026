import { Routes } from '@angular/router';
import { Layout } from './core/layout/layout';
import { Login } from './features/auth/login/login';
import { Inicio } from './features/dashboard/inicio/inicio'; // <-- Importar

export const routes: Routes = [
  { 
    path: 'login', 
    component: Login 
  },
  {
    path: 'inicio',
    component: Layout,
    children: [     
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: '', component: Inicio } // <-- Ruta registrada
    ]
  },
  { path: '**', redirectTo: 'login' } 
];