import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Importamos los servicios que ya creamos
import { InformacionService } from '@core/services/informacion/informacion';
import { CuidadosService } from '@core/services/cuidados/cuidados';
import { NoticiasService } from '@core/services/noticias/noticias';
import { PortalMedicoService, ProfesionalPerfil } from '@core/services/portal-medico/portal-medico';

// IMPORT DE TEXTOS
import { TextosService } from '@core/services/textos/textos';

/** Tipo de elemento que puede aparecer en la lista de "Actividad Reciente". */
type TipoActividad = 'informacion' | 'cuidado' | 'noticia';

/** Un elemento normalizado de la lista de actividad reciente (contenido creado). */
interface ActividadItem {
  tipo: TipoActividad;
  titulo: string;
  fecha: Date | null;
  /** Usado como criterio de orden cuando la fecha no está disponible (ver Cuidado.fecha_creacion). */
  claveOrden: number;
  ruta: (string | number)[];
  icono: string;
  colorClass: string;
  bgClass: string;
}

/** Un profesional cuya acreditación está pendiente de revisión. */
interface ProfesionalPendiente {
  idProfesional: number;
  nombreCompleto: string;
  numeroRegistro: string;
  fechaSolicitud: Date | null;
  ruta: (string | number)[];
}

const ICONO_INFORMACION = 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
const ICONO_CUIDADO = 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z';
const ICONO_NOTICIA = 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15';

// Cuántos elementos de actividad reciente / profesionales pendientes se muestran como máximo.
const MAX_ACTIVIDAD = 5;
const MAX_PENDIENTES_VISIBLES = 3;

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.scss']
})
export class Inicio implements OnInit {
  nombreUsuario: string = 'Administrador';
  fechaActual: Date = new Date();
  cargandoStats = true;
  cargandoActividad = true;
  public textosService = inject(TextosService)

  public t = this.textosService.t;

  // Últimos elementos creados (información, cuidados, noticias), más recientes primero.
  actividadReciente: ActividadItem[] = [];

  // Profesionales con acreditación pendiente de revisión.
  profesionalesPendientes: ProfesionalPendiente[] = [];

  // Inicializamos los valores en 0
  estadisticas = [
    {
      // titulo: 'Información Publicada',
      titulo: this.textosService.t().inicio_admin.informacion_publicada,
      valor: 0,
      icono: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      colorClass: 'text-blue-600',
      bgClass: 'bg-blue-100'
    },
    {
      titulo: this.textosService.t().inicio_admin.cuidados_activos,
      valor: 0,
      icono: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
      colorClass: 'text-rose-600',
      bgClass: 'bg-rose-100'
    },
    {
      titulo: this.textosService.t().inicio_admin.noticias_recientes,
      valor: 0,
      icono: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15',
      colorClass: 'text-amber-600',
      bgClass: 'bg-amber-100'
    }
  ];

  accesosRapidos = [
    { titulo: this.textosService.t().inicio_admin.nueva_informacion, ruta: '/administracion/informacion/crear', icono: 'M12 4v16m8-8H4' },
    { titulo: this.textosService.t().inicio_admin.nuevo_cuidado, ruta: '/administracion/cuidados/crear', icono: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { titulo: this.textosService.t().inicio_admin.nueva_noticia, ruta: '/administracion/noticias/crear', icono: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' }
  ];

  constructor(
    private informacionService: InformacionService,
    private cuidadosService: CuidadosService,
    private noticiasService: NoticiasService,
    private portalMedicoService: PortalMedicoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDatosUsuario();
    this.cargarEstadisticas();
    this.cargarActividadReciente();
  }

  getTituloBienvenida(): string {
    return this.textosService.reemplazarVariables(
      this.t().inicio_admin.bienvenida_titulo,
      { nombre: this.nombreUsuario }
    );
  }

  cargarDatosUsuario(): void {
    const userDataStr = localStorage.getItem('user_data');
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        if (userData.nombre) {
          this.nombreUsuario = userData.nombre;
        }
      } catch (e) {
        console.error('Error al parsear datos de usuario');
      }
    }
  }

  cargarEstadisticas(): void {
    this.cargandoStats = true;

    // forkJoin ejecuta ambas peticiones al mismo tiempo
    forkJoin({
      informacion: this.informacionService.getInformacion(),
      cuidados: this.cuidadosService.getCuidados(),
      noticias: this.noticiasService.getNoticias()
    }).subscribe({
      next: (respuestas) => {
        // Filtramos para contar solo los registros activos (estado = true)
        const totalInfo = respuestas.informacion.filter(item => item.estado).length;
        const totalCuidados = respuestas.cuidados.filter(item => item.estado).length;
        const totalNoticias = respuestas.noticias.filter(item => item.estado).length;

        // Actualizamos los valores en nuestras tarjetas
        this.estadisticas[0].valor = totalInfo;
        this.estadisticas[1].valor = totalCuidados;
        this.estadisticas[2].valor = totalNoticias;

        this.cargandoStats = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar estadísticas del dashboard', err);
        this.cargandoStats = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Trae los últimos elementos creados en el sitio (información, cuidados, noticias) y
   * los profesionales con acreditación pendiente, y arma las dos listas que se muestran
   * en la sección "Actividad Reciente". Cada fuente se protege con catchError para que
   * si una falla (ej. el backend del Portal Médico está caído) no tumbe a las demás.
   */
  cargarActividadReciente(): void {
    this.cargandoActividad = true;

    forkJoin({
      informacion: this.informacionService.getInformacion().pipe(catchError(() => of([]))),
      cuidados: this.cuidadosService.getCuidados().pipe(catchError(() => of([]))),
      noticias: this.noticiasService.getNoticias().pipe(catchError(() => of([]))),
      // La cola de revisión son DOS estados, no uno. Una acreditación nace en
      // PENDIENTE y pasa a EN_REVISION en cuanto el profesional sube su primer
      // documento (ver subir_documento en PmMedico/queryset.py). Pidiendo solo
      // PENDIENTE, el profesional desaparecía de aquí justo cuando adjuntaba lo
      // que hacía falta para revisarlo, que es exactamente al revés. Es el mismo
      // criterio que usa PM_AcreditacionQueryset.pendientes() en el backend.
      pendientes: this.portalMedicoService.getProfesionales('PENDIENTE').pipe(catchError(() => of([] as ProfesionalPerfil[]))),
      enRevision: this.portalMedicoService.getProfesionales('EN_REVISION').pipe(catchError(() => of([] as ProfesionalPerfil[])))
    }).subscribe({
      next: ({ informacion, cuidados, noticias, pendientes, enRevision }) => {
        const items: ActividadItem[] = [
          ...informacion.map(item => ({
            tipo: 'informacion' as const,
            titulo: item.titulo,
            fecha: item.fecha_creacion ? new Date(item.fecha_creacion) : null,
            claveOrden: item.fecha_creacion ? new Date(item.fecha_creacion).getTime() : item.id_informacion,
            ruta: ['/administracion/informacion/editar', item.id_informacion],
            icono: ICONO_INFORMACION,
            colorClass: 'text-blue-600',
            bgClass: 'bg-blue-100'
          })),
          ...cuidados.map(item => ({
            tipo: 'cuidado' as const,
            titulo: item.titulo,
            fecha: item.fecha_creacion ? new Date(item.fecha_creacion) : null,
            // Los cuidados creados antes de agregar fecha_creacion al backend no la tienen:
            // usamos el id (autoincremental) como respaldo para ordenarlos igual de "antiguos".
            claveOrden: item.fecha_creacion ? new Date(item.fecha_creacion).getTime() : item.id_cuidado,
            ruta: ['/administracion/cuidados/editar', item.id_cuidado],
            icono: ICONO_CUIDADO,
            colorClass: 'text-rose-600',
            bgClass: 'bg-rose-100'
          })),
          ...noticias.map(item => ({
            tipo: 'noticia' as const,
            titulo: item.titulo,
            fecha: item.fecha_creacion ? new Date(item.fecha_creacion) : null,
            claveOrden: item.fecha_creacion ? new Date(item.fecha_creacion).getTime() : item.id_noticia,
            ruta: ['/administracion/noticias/editar', item.id_noticia],
            icono: ICONO_NOTICIA,
            colorClass: 'text-amber-600',
            bgClass: 'bg-amber-100'
          }))
        ];

        this.actividadReciente = items
          .sort((a, b) => b.claveOrden - a.claveOrden)
          .slice(0, MAX_ACTIVIDAD);

        this.profesionalesPendientes = [...pendientes, ...enRevision]
          .map(profesional => {
            const acreditacion = profesional.acreditaciones?.[0];
            const fechaSolicitud = acreditacion?.fecha_solicitud_profesional || profesional.fecha_creacion;
            return {
              idProfesional: profesional.id_profesional,
              nombreCompleto: `${profesional.nombres_profesional} ${profesional.apellidos_profesional}`,
              numeroRegistro: profesional.numero_registro_salud_profesional,
              fechaSolicitud: fechaSolicitud ? new Date(fechaSolicitud) : null,
              ruta: ['/administracion/portal-medico/profesionales', profesional.id_profesional]
            };
          })
          .sort((a, b) => (b.fechaSolicitud?.getTime() ?? 0) - (a.fechaSolicitud?.getTime() ?? 0));

        this.cargandoActividad = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar la actividad reciente del dashboard', err);
        this.cargandoActividad = false;
        this.cdr.detectChanges();
      }
    });
  }

  /** Etiqueta corta del tipo de contenido, usada como badge en cada fila de la lista. */
  etiquetaTipo(tipo: TipoActividad): string {
    switch (tipo) {
      case 'informacion': return this.t().inicio_admin.actividad_tipo_informacion;
      case 'cuidado': return this.t().inicio_admin.actividad_tipo_cuidado;
      case 'noticia': return this.t().inicio_admin.actividad_tipo_noticia;
    }
  }

  /** Cuántos profesionales pendientes quedan fuera de la vista previa (MAX_PENDIENTES_VISIBLES). */
  get pendientesVisibles(): ProfesionalPendiente[] {
    return this.profesionalesPendientes.slice(0, MAX_PENDIENTES_VISIBLES);
  }

  get pendientesOcultos(): number {
    return Math.max(0, this.profesionalesPendientes.length - MAX_PENDIENTES_VISIBLES);
  }

  get avisoPendientes(): string {
    const n = this.profesionalesPendientes.length;
    if (n === 1) return this.t().inicio_admin.pendientes_aviso_singular;
    return this.textosService.reemplazarVariables(this.t().inicio_admin.pendientes_aviso_plural, { n: String(n) });
  }

  get textoVerMasPendientes(): string {
    return this.textosService.reemplazarVariables(this.t().inicio_admin.pendientes_ver_mas, { n: String(this.pendientesOcultos) });
  }

  /** Traduce una fecha a una etiqueta relativa corta ("Hace 3 h", "Ayer", "12/08/2026", etc.). */
  formatearTiempoRelativo(fecha: Date | null): string {
    if (!fecha) return this.t().inicio_admin.actividad_fecha_desconocida;

    const diffMs = new Date().getTime() - fecha.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMin / 60);
    const diffDias = Math.floor(diffHoras / 24);

    if (diffMin < 1) return this.t().inicio_admin.actividad_ahora_mismo;
    if (diffMin < 60) return this.textosService.reemplazarVariables(this.t().inicio_admin.actividad_hace_minutos, { n: String(diffMin) });
    if (diffHoras < 24) return this.textosService.reemplazarVariables(this.t().inicio_admin.actividad_hace_horas, { n: String(diffHoras) });
    if (diffDias === 1) return this.t().inicio_admin.actividad_ayer;
    if (diffDias < 7) return this.textosService.reemplazarVariables(this.t().inicio_admin.actividad_hace_dias, { n: String(diffDias) });

    return fecha.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  get sinActividad(): boolean {
    return !this.cargandoActividad && this.actividadReciente.length === 0 && this.profesionalesPendientes.length === 0;
  }
}
