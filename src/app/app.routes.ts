import { Routes } from '@angular/router';
import { Layout } from '../proyectos/administracion/layout/layout';
import { Login } from '../proyectos/administracion/features/auth/login/login';
import { Inicio } from '../proyectos/administracion/features/dashboard/inicio/inicio';
import { InformacionComponent } from '../proyectos/administracion/features/informacion/informacion';
import { CrearInformacion } from '../proyectos/administracion/features/informacion/crear/crear';
import { EditarInformacion } from '../proyectos/administracion/features/informacion/editar/editar';
import { Cuidados } from '../proyectos/administracion/features/cuidados/cuidados';
import { CrearCuidado } from '../proyectos/administracion/features/cuidados/crear/crear';
import { EditarCuidado } from '../proyectos/administracion/features/cuidados/editar/editar';
import { VozAdminComponent } from '../proyectos/administracion/features/voz/voz';
import { CrearVoz } from '../proyectos/administracion/features/voz/crear/crear';
import { EditarVoz } from '../proyectos/administracion/features/voz/editar/editar';
import { NoticiasAdminComponent } from '../proyectos/administracion/features/noticias/noticias';
import { CrearNoticia } from '../proyectos/administracion/features/noticias/crear/crear';
import { EditarNoticia } from '../proyectos/administracion/features/noticias/editar/editar';
import { AdministracionInicioComponent } from '../proyectos/administracion/features/administracion/inicio/administracion-inicio';
import { AdministracionInicioCrearComponent } from '../proyectos/administracion/features/administracion/inicio/crear/administracion-inicio-crear';
import { AdministracionUsuarioComponent } from '../proyectos/administracion/features/administracion/usuarios/administracion-usuarios';
import { AdministracionUsuarioCrearComponente } from '../proyectos/administracion/features/administracion/usuarios/crear/administracion-usuarios-crear';
import { AdministracionInicioEditarComponent } from '../proyectos/administracion/features/administracion/inicio/editar/administracion-inicio-editar';
import { AdministracionUsuarioEditarComponent } from '../proyectos/administracion/features/administracion/usuarios/editar/administracion-usuarios-editar';
import { AdministracionInformacionGeneralComponent } from '../proyectos/administracion/features/administracion/infoGeneral/infoGeneral';
import { AdministracionInfoGeneralCrearComponent } from '../proyectos/administracion/features/administracion/infoGeneral/crear/infoGeneral-crear';
import { AdministracionInfoGeneralEditarComponent } from '../proyectos/administracion/features/administracion/infoGeneral/editar/infoGeneral-editar';

// IMPORTACIONES DEL PORTAL PÚBLICO
import { ClienteLayout } from '../proyectos/cliente/layout/layout';
import { InicioClienteComponent } from '../proyectos/cliente/inicio-cliente/inicio-cliente';
import { InformacionClienteComponent } from '../proyectos/cliente/informacion/informacion';
import { InformacionDetalleComponent } from '../proyectos/cliente/informacion-detalle/informacion-detalle';
import { CuidadosClienteComponent } from '../proyectos/cliente/cuidados/cuidados';
import { CuidadosDetalleComponent } from '../proyectos/cliente/cuidados-detalle/cuidados-detalle';
import { VozClienteComponent } from '../proyectos/cliente/voz/voz';
import { VozDetalleComponent } from '../proyectos/cliente/voz-detalle/voz-detalle';
import { FarmacosClienteComponent } from '../proyectos/cliente/farmacos/farmacos';
import { PromocionClienteComponent } from '../proyectos/cliente/promocion/promocion';
import { NoticiasClienteComponent } from '../proyectos/cliente/noticias/noticias';
import { NoticiasDetalleComponent } from '../proyectos/cliente/noticias-detalle/noticias-detalle';
// import { FarmacosDetalleComponent } from '../proyectos/cliente/farmacos-detalle/farmacos-detalle';

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

      // RUTAS DE LA VOZ
      { path: 'lavoz', component: VozClienteComponent },
      { path: 'lavoz/:id', component: VozDetalleComponent },

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
      // LA VOZ
      { path: 'administracion/voz', component: VozAdminComponent },
      { path: 'administracion/voz/crear', component: CrearVoz },
      { path: 'administracion/voz/editar/:id', component: EditarVoz },
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