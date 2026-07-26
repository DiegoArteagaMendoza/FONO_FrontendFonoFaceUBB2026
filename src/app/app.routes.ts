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
import { NoticiasAdminComponent } from './features/noticias/noticias';
import { CrearNoticia } from './features/noticias/crear/crear';
import { EditarNoticia } from './features/noticias/editar/editar';
import { AdministracionInicioComponent } from './features/administracion/inicio/administracion-inicio';
import { AdministracionInicioCrearComponent } from './features/administracion/inicio/crear/administracion-inicio-crear';
import { AdministracionUsuarioComponent } from './features/administracion/usuarios/administracion-usuarios';
import { AdministracionUsuarioCrearComponente } from './features/administracion/usuarios/crear/administracion-usuarios-crear';
import { AdministracionInicioEditarComponent } from './features/administracion/inicio/editar/administracion-inicio-editar';
import { AdministracionUsuarioEditarComponent } from './features/administracion/usuarios/editar/administracion-usuarios-editar';
import { AdministracionInformacionGeneralComponent } from './features/administracion/infoGeneral/infoGeneral';
import { AdministracionInfoGeneralCrearComponent } from './features/administracion/infoGeneral/crear/infoGeneral-crear';
import { AdministracionInfoGeneralEditarComponent } from './features/administracion/infoGeneral/editar/infoGeneral-editar';

// IMPORTACIONES DEL PORTAL PÚBLICO
import { ClienteLayout } from './frontendcliente/cliente/layout/layout';
import { InicioClienteComponent } from '../app/frontendcliente/cliente/inicio-cliente/inicio-cliente';
import { InformacionClienteComponent } from '../app/frontendcliente/cliente/informacion/informacion';
import { InformacionDetalleComponent } from '../app/frontendcliente/cliente/informacion-detalle/informacion-detalle';
import { CuidadosClienteComponent } from './frontendcliente/cliente/cuidados/cuidados';
import { CuidadosDetalleComponent } from './frontendcliente/cliente/cuidados-detalle/cuidados-detalle';
import { FarmacosClienteComponent } from './frontendcliente/cliente/farmacos/farmacos';
import { PromocionClienteComponent } from './frontendcliente/cliente/promocion/promocion';
import { NoticiasClienteComponent } from './frontendcliente/cliente/noticias/noticias';
import { NoticiasDetalleComponent } from './frontendcliente/cliente/noticias-detalle/noticias-detalle';
// import { FarmacosDetalleComponent } from './frontendcliente/cliente/farmacos-detalle/farmacos-detalle';

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
      
      // RUTAS DE FÁRMACOS
      { path: 'farmacos', component: FarmacosClienteComponent }, 
      { path: 'farmacos/:id', component: InformacionDetalleComponent }, 

      // RUTAS DE PREVENCIÓN
      { path: 'prevencion', component: InformacionClienteComponent },
      { path: 'prevencion/:id', component: InformacionDetalleComponent }, 

      // RUTAS DE PROMOCIÓN
      { path: 'promocion', component: PromocionClienteComponent },
      { path: 'promocion/:id', component: InformacionDetalleComponent }, 

      // RUTAS DE NOTICIAS
      { path: 'noticias', component: NoticiasClienteComponent },
      { path: 'noticias/:id', component: NoticiasDetalleComponent },

      // RUTAS DE CUIDADOS
      { path: 'cuidados', component: CuidadosClienteComponent },
      { path: 'cuidados/:id', component: CuidadosDetalleComponent },
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
      // INICIO
      { path: 'administracion/inicio', component: Inicio },
      // INFORMACION
      { path: 'administracion/informacion', component: InformacionComponent },
      { path: 'administracion/informacion/crear', component: CrearInformacion },
      { path: 'administracion/informacion/editar/:id', component: EditarInformacion },
      // CUIDADOS
      { path: 'administracion/cuidados', component: Cuidados },
      { path: 'administracion/cuidados/crear', component: CrearCuidado },
      { path: 'administracion/cuidados/editar/:id', component: EditarCuidado },
      // NOTICIAS
      { path: 'administracion/noticias', component: NoticiasAdminComponent },
      { path: 'administracion/noticias/crear', component: CrearNoticia },
      { path: 'administracion/noticias/editar/:id', component: EditarNoticia },
      // ADMINISTRACION BANNER
      { path: 'administracion/carrusel/inicio', component: AdministracionInicioComponent },
      { path: 'administracion/carrusel/inicio/crear', component: AdministracionInicioCrearComponent},
      { path: 'administracion/carrusel/inicio/editar/:id', component: AdministracionInicioEditarComponent },
      // ADMINISTRACION USUARIOS
      { path: 'administracion/usuario', component: AdministracionUsuarioComponent },
      { path: 'administracion/usuario/crear', component: AdministracionUsuarioCrearComponente },
      { path: 'administracion/usuario/editar/:id', component: AdministracionUsuarioEditarComponent },
      // ADMINISTRACION INFORMACIÓN GENERAL
      { path: 'administracion/informacion/inicio', component: AdministracionInformacionGeneralComponent },
      { path: 'administracion/informacion/inicio/crear', component: AdministracionInfoGeneralCrearComponent },
      { path: 'administracion/informacion/inicio/editar/:id', component: AdministracionInfoGeneralEditarComponent }
    ]
  },
];