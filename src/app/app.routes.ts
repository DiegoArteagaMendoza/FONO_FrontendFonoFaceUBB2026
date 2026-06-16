import { Routes } from '@angular/router';
import { Layout } from './core/layout/layout';
import { Login } from './features/auth/login/login';
import { Inicio } from './features/dashboard/inicio/inicio';
// 1. Importa el nuevo componente
import { InformacionComponent } from './features/informacion/informacion';
import { Crear } from './features/informacion/crear/crear';
import { Editar } from './features/informacion/editar/editar';

export const routes: Routes = [
  { 
    path: 'login', 
    component: Login 
  },
  {
    path: '',
    component: Layout, // El Layout envuelve a todos estos hijos
    children: [     
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'inicio', component: Inicio },
      { path: 'informacion', component: InformacionComponent },
      { path: 'informacion/crear', component: Crear },
      { path: 'informacion/editar/:id', component: Editar },
    ]
  },
  // Cualquier ruta que no coincida con las de arriba, se va al login
  { path: '**', redirectTo: 'login' } 
];