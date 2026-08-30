import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { soloVisitantes } from './core/guards/solo-visitantes.guard';
import { requiereSesion } from './core/guards/requiere-sesion.guard';
import { sinProfesional } from './core/guards/sin-profesional.guard';
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
import { Diagnostico } from '../proyectos/administracion/features/diagnostico/diagnostico';
import { CrearDiagnostico } from '../proyectos/administracion/features/diagnostico/crear/crear';
import { EditarDiagnostico } from '../proyectos/administracion/features/diagnostico/editar/editar';
import { ResultadosDiagnostico } from '../proyectos/administracion/features/diagnostico/resultados/resultados';
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
import { InformacionDetalleComponent } from '../proyectos/cliente/informacion/informacion-detalle/informacion-detalle';
import { CuidadosClienteComponent } from '../proyectos/cliente/cuidados/cuidados';
import { CuidadosDetalleComponent } from '../proyectos/cliente/cuidados/cuidados-detalle/cuidados-detalle';
import { VozClienteComponent } from '../proyectos/cliente/voz/voz';
import { VozDetalleComponent } from '../proyectos/cliente/voz/voz-detalle/voz-detalle';
import { FarmacosClienteComponent } from '../proyectos/cliente/farmacos/farmacos';
import { PromocionClienteComponent } from '../proyectos/cliente/promocion/promocion';
import { NoticiasClienteComponent } from '../proyectos/cliente/noticias/noticias';
import { NoticiasDetalleComponent } from '../proyectos/cliente/noticias/noticias-detalle/noticias-detalle';
import { AutoevaluacionClienteComponent } from '../proyectos/cliente/autoevaluacion/autoevaluacion';
import { AutoevaluacionDetalleComponent } from '../proyectos/cliente/autoevaluacion/autoevaluacion-detalle/autoevaluacion-detalle';
// import { FarmacosDetalleComponent } from '../proyectos/cliente/farmacos-detalle/farmacos-detalle';

// IMPORTACIONES DEL PORTAL MÉDICO (profesionales fonoaudiólogos, backend FonoAppPortalMedico)
import { PortalMedicoLayout } from '../proyectos/portalMedico/layout/layout';
import { PortalMedicoInicioComponent } from '../proyectos/portalMedico/features/inicio/inicio';
import { PortalMedicoLoginComponent } from '../proyectos/portalMedico/features/auth/login/login';
import { PortalMedicoRegistroComponent } from '../proyectos/portalMedico/features/auth/registro/registro';
import { PortalMedicoDirectorioComponent } from '../proyectos/portalMedico/features/directorio/directorio';
import { PortalMedicoPerfilComponent } from '../proyectos/portalMedico/features/perfil/perfil';
import { PortalMedicoDocumentosComponent } from '../proyectos/portalMedico/features/documentos/documentos';
import { PortalMedicoEspecialidadesComponent } from '../proyectos/portalMedico/features/especialidades/especialidades';
import { PortalMedicoAcreditacionComponent } from '../proyectos/portalMedico/features/acreditacion/acreditacion';
// Lado paciente del Portal Médico (backend: apps PmCliente, PmVideo y PmCita)
import { PmClienteRegistroComponent } from '../proyectos/portalMedico/features/cliente/registro/registro';
import { PmClienteVideoComponent } from '../proyectos/portalMedico/features/cliente/video/video';
import { PmClienteMisCitasComponent } from '../proyectos/portalMedico/features/cliente/citas/mis-citas/mis-citas';
import { PmClienteReservarCitaComponent } from '../proyectos/portalMedico/features/cliente/citas/reservar/reservar';
import { PmClienteSeguimientoCitaComponent } from '../proyectos/portalMedico/features/cliente/citas/seguimiento/seguimiento';
// Agenda del profesional (app PmCita, lado del fonoaudiólogo)
import { PmAgendaComponent } from '../proyectos/portalMedico/features/agenda/agenda';
import { PmDisponibilidadComponent } from '../proyectos/portalMedico/features/disponibilidad/disponibilidad';
// Panel de administración del Portal Médico: se renderiza dentro del Layout de
// administracion/ (mismo sidebar/sesión de FonoApp), por eso se registra como hijo
// de ese Layout más abajo en vez de dentro del bloque 'portalmedico/*'.
import { PmAdminProfesionalesComponent } from '../proyectos/portalMedico/features/admin/profesionales/admin-profesionales';
import { PmAdminProfesionalDetalleComponent } from '../proyectos/portalMedico/features/admin/profesionales/detalle/admin-profesional-detalle';
import { PmAdminEspecialidadesComponent } from '../proyectos/portalMedico/features/admin/especialidades/admin-especialidades';

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
    canActivate: [soloVisitantes('admin')]
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

      // RUTAS DE AUTOEVALUACIÓN (backend FonoApp, app FonoAppDiagnostico).
      // Públicas: el cliente responde el test sin necesidad de cuenta propia.
      { path: 'autoevaluacion', component: AutoevaluacionClienteComponent },
      { path: 'autoevaluacion/:id', component: AutoevaluacionDetalleComponent },
    ]
  },

  // 1.b PORTAL MÉDICO: autoservicio de profesionales fonoaudiólogos (registro, login,
  // perfil, documentos de respaldo, especialidades y estado de acreditación).
  // Es una identidad distinta a la del portal público y a la del panel admin: usa su
  // propia sesión JWT (ver PortalMedicoService) y su propio layout con navbar.
  {
    path: 'portalmedico',
    component: PortalMedicoLayout,
    children: [
      { path: 'inicio', component: PortalMedicoInicioComponent },
      { path: 'login', component: PortalMedicoLoginComponent, canActivate: [soloVisitantes('portalMedico')] },
      { path: 'registro', component: PortalMedicoRegistroComponent, canActivate: [soloVisitantes('profesional')] },
      // El directorio es la vitrina donde el paciente busca con quién atenderse.
      // Al fonoaudiólogo no le corresponde: ahí solo vería a sus colegas.
      { path: 'directorio', component: PortalMedicoDirectorioComponent, canActivate: [sinProfesional] },
      { path: 'perfil', component: PortalMedicoPerfilComponent },
      { path: 'documentos', component: PortalMedicoDocumentosComponent },
      { path: 'especialidades', component: PortalMedicoEspecialidadesComponent },
      { path: 'acreditacion', component: PortalMedicoAcreditacionComponent },
      // Agenda del profesional: las citas que sus pacientes reservaron con él
      { path: 'agenda', component: PmAgendaComponent },
      // Horas que el profesional publica para que los pacientes las reserven
      { path: 'disponibilidad', component: PmDisponibilidadComponent },

      // LADO PACIENTE: registro, sesión propia y videos de síntomas.
      // Usa su propia identidad JWT (claim 'id_cliente'), separada de la del
      // profesional y de la del administrador de FonoApp.
      { path: 'paciente/registro', component: PmClienteRegistroComponent },
      // El login del paciente se fusionó con el del profesional en una sola vista
      // con pestañas. Se conserva la ruta para no romper enlaces existentes.
      {
        path: 'paciente/login',
        // redirectTo con string no admite query params, por eso se usa la forma
        // de función: así la pestaña "paciente" queda preseleccionada.
        redirectTo: () => inject(Router).createUrlTree(['/portalmedico/login'], { queryParams: { tipo: 'paciente' } }),
        pathMatch: 'full'
      },
      { path: 'paciente/video', component: PmClienteVideoComponent },

      // Citas del paciente (app PmCita). 'reservar' va antes que la lista para
      // dejar claro el orden de lectura; no hay conflicto de rutas entre ambas.
      { path: 'paciente/citas', component: PmClienteMisCitasComponent },
      { path: 'paciente/citas/reservar', component: PmClienteReservarCitaComponent },

      // Seguimiento con el código del correo: público, es la vía de quien
      // reservó sin cuenta para gestionar su hora.
      { path: 'cita/seguimiento', component: PmClienteSeguimientoCitaComponent },

      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
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
    // La guarda va en el padre y no en cada hija: cubre las rutas de golpe y,
    // sobre todo, no hay forma de olvidarla al agregar una pantalla nueva.
    canActivate: [requiereSesion('admin')],
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
      // DIAGNOSTICO (AUTOEVALUACION): lo puede crear cualquier rol de administrador
      { path: 'administracion/diagnostico', component: Diagnostico },
      { path: 'administracion/diagnostico/crear', component: CrearDiagnostico },
      { path: 'administracion/diagnostico/editar/:id', component: EditarDiagnostico },
      { path: 'administracion/diagnostico/:id/resultados', component: ResultadosDiagnostico },
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
      { path: 'administracion/informacion/inicio/editar/:id', component: AdministracionInfoGeneralEditarComponent },
      // PORTAL MÉDICO (panel de revisión de acreditaciones): vive físicamente en
      // proyectos/portalMedico/features/admin, pero se enruta aquí, dentro del mismo
      // Layout/sidebar de administracion/, porque lo usan los mismos administradores
      // de FonoApp ya autenticados (comparten el 'access_token' de AuthService).
      { path: 'administracion/portal-medico/profesionales', component: PmAdminProfesionalesComponent },
      { path: 'administracion/portal-medico/profesionales/:id', component: PmAdminProfesionalDetalleComponent },
      { path: 'administracion/portal-medico/especialidades', component: PmAdminEspecialidadesComponent }
    ]
  },
];