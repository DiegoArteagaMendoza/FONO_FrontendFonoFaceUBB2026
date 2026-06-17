import { Routes } from '@angular/router';
import { Layout } from './core/layout/layout';
import { Login } from './features/auth/login/login';
import { Inicio } from './features/dashboard/inicio/inicio';
import { InformacionComponent } from './features/informacion/informacion';
import { CrearInformacion } from './features/informacion/crear/crear';
import { EditarInformacion } from './features/informacion/editar/editar';
import { Cuidados } from './features/cuidados/cuidados';
import { CrearCuidado } from './features/cuidados/crear/crear';
import { EditarCuidado } from './features/cuidados/editar/editar';

// IMPORTACIONES DEL PORTAL PÚBLICO
import { ClienteLayout } from './frontendcliente/cliente/layout/layout';
import { InicioClienteComponent } from '../app/frontendcliente/cliente/inicio-cliente/inicio-cliente';
import { InformacionClienteComponent } from '../app/frontendcliente/cliente/informacion/informacion';
import { InformacionDetalleComponent } from '../app/frontendcliente/cliente/informacion-detalle/informacion-detalle';

export const routes: Routes = [
  { 
    path: 'login', 
    component: Login 
  },
  
  // 1. PORTAL PÚBLICO: Envuelto en su propio Layout con Navbar superior
  {
    path: 'portal',
    component: ClienteLayout,
    children: [
      { path: 'inicio', component: InicioClienteComponent },
      { path: 'informacion', component: InformacionClienteComponent },
      { path: 'informacion/:id', component: InformacionDetalleComponent },
      // { path: 'cuidados', component: CuidadosClienteComponent },
    ]
  },

  // Redirección inicial por defecto hacia el inicio público
  { 
    path: '', 
    redirectTo: '/portal/inicio', 
    pathMatch: 'full' 
  },

  // 2. PANEL DE ADMINISTRACIÓN: Envuelto en el Layout con Sidebar lateral
  {
    path: '',
    component: Layout,
    children: [     
      { path: 'inicio', component: Inicio },
      { path: 'informacion', component: InformacionComponent },
      { path: 'informacion/crear', component: CrearInformacion },
      { path: 'informacion/editar/:id', component: EditarInformacion },
      { path: 'cuidados', component: Cuidados }, 
      { path: 'cuidados/crear', component: CrearCuidado },
      { path: 'cuidados/editar/:id', component: EditarCuidado },
      
      { path: 'noticias', redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'administracion', redirectTo: 'inicio', pathMatch: 'full' }
    ]
  },

  // Si digitan cualquier otra cosa, se devuelven a la página de inicio pública
  { 
    path: '**', 
    redirectTo: '/portal/inicio' 
  }
];