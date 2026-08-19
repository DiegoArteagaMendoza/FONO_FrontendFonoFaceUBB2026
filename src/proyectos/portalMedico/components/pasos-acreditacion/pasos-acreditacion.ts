import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProfesionalPerfil } from '@core/services/portal-medico/portal-medico';
import { TextosService } from '@core/services/textos/textos';

interface PasoAcreditacion {
  titulo: string;
  descripcion: string;
  completado: boolean;
  ruta: string | null;
}

/**
 * Guía visual del avance de la acreditación del profesional.
 *
 * Nace de un problema concreto de usabilidad: al registrarse, la persona
 * quedaba en un portal con cuatro secciones sueltas (documentos,
 * especialidades, acreditación, perfil) sin ninguna indicación de qué hacer
 * primero ni de qué le faltaba para aparecer en el directorio. Este
 * componente responde esa pregunta de un vistazo y enlaza al paso pendiente.
 */
@Component({
  selector: 'app-pm-pasos-acreditacion',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pasos-acreditacion.html'
})
export class PasosAcreditacionComponent {
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  /** Perfil completo del profesional (trae documentos, especialidades y acreditaciones) */
  @Input() perfil: ProfesionalPerfil | null = null;

  get pasos(): PasoAcreditacion[] {
    const textos = this.t().pm_pasos;
    const tieneDocumentos = (this.perfil?.documentos?.length ?? 0) > 0;
    const tieneEspecialidades = (this.perfil?.especialidades_asignadas?.length ?? 0) > 0;
    const estaAprobado = this.estadoVigente === 'APROBADO';

    return [
      {
        titulo: textos.paso_1_titulo,
        descripcion: textos.paso_1_desc,
        completado: !!this.perfil,       // si hay perfil, la cuenta ya existe
        ruta: null
      },
      {
        titulo: textos.paso_2_titulo,
        descripcion: textos.paso_2_desc,
        completado: tieneDocumentos,
        ruta: '/portalmedico/documentos'
      },
      {
        titulo: textos.paso_3_titulo,
        descripcion: textos.paso_3_desc,
        completado: tieneEspecialidades,
        ruta: '/portalmedico/especialidades'
      },
      {
        titulo: textos.paso_4_titulo,
        descripcion: textos.paso_4_desc,
        completado: estaAprobado,
        ruta: '/portalmedico/acreditacion'
      }
    ];
  }

  /** Estado de la acreditación más reciente */
  get estadoVigente(): string | null {
    const acreditaciones = this.perfil?.acreditaciones;
    if (!acreditaciones || acreditaciones.length === 0) return null;
    return acreditaciones[acreditaciones.length - 1].estado_verificacion_profesional;
  }

  /** Índice del primer paso sin completar (el que la persona debe atender ahora) */
  get indicePasoActual(): number {
    return this.pasos.findIndex(paso => !paso.completado);
  }

  get totalCompletados(): number {
    return this.pasos.filter(paso => paso.completado).length;
  }

  get porcentaje(): number {
    return Math.round((this.totalCompletados / this.pasos.length) * 100);
  }

  esPasoActual(indice: number): boolean {
    return indice === this.indicePasoActual;
  }
}
