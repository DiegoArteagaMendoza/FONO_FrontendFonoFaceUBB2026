import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  PortalMedicoService,
  ProfesionalPerfil,
  DocumentoRespaldo
} from '@core/services/portal-medico/portal-medico';
import { AdministracionService } from '@core/services/administracion/administracion';
import { TextosService } from '@core/services/textos/textos';

@Component({
  selector: 'app-pm-admin-profesional-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-profesional-detalle.html'
})
export class PmAdminProfesionalDetalleComponent implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  profesional: ProfesionalPerfil | null = null;
  cargando = true;
  errorMensaje: string | null = null;
  mensajeExito: string | null = null;
  procesandoAcreditacion = false;
  procesandoDocumento: number | null = null;

  // Documento que se está revisando en el visor (null = visor cerrado)
  documentoAbierto: DocumentoRespaldo | null = null;
  urlDocumentoSegura: SafeResourceUrl | null = null;

  // Baja / alta de la cuenta. La baja pide motivo antes de ejecutarse: lo que
  // se escriba viaja en el correo a los pacientes cuya hora se cancela.
  confirmandoBaja = false;
  motivoBaja = '';
  procesandoEstado = false;

  private sanitizer = inject(DomSanitizer);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private portalMedicoService: PortalMedicoService,
    // Público: el HTML lo usa para mostrar u ocultar los botones de aprobar/
    // rechazar/validar según si el admin logueado ya tiene rol máximo, en vez
    // de dejar que el usuario haga clic y reciba un 403.
    public adminService: AdministracionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idProfesional = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarDetalle(idProfesional);
  }

  cargarDetalle(idProfesional: number): void {
    this.cargando = true;
    this.portalMedicoService.getProfesionalDetalle(idProfesional).subscribe({
      next: (datos) => {
        this.profesional = datos;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar el detalle del profesional', err);
        this.cargando = false;
        this.errorMensaje = this.portalMedicoService.extraerMensajeError(err, this.t().erorres.error_cargando_datos);
        this.cdr.detectChanges();
      }
    });
  }

  get acreditacionVigente() {
    return this.profesional?.acreditaciones?.[0] ?? null;
  }

  resolverAcreditacion(nuevoEstado: 'APROBADO' | 'RECHAZADO'): void {
    const acreditacion = this.acreditacionVigente;
    if (!acreditacion || !this.profesional) return;

    const mensajeConfirmacion = nuevoEstado === 'APROBADO'
      ? this.t().pm_profesional_detalle.confirmar_aprobar
      : this.t().pm_profesional_detalle.confirmar_rechazar;

    if (!confirm(mensajeConfirmacion)) return;

    this.errorMensaje = null;
    this.mensajeExito = null;
    this.procesandoAcreditacion = true;
    const idProfesional = this.profesional.id_profesional;

    this.portalMedicoService.resolverAcreditacion(acreditacion.id_acreditacion, nuevoEstado).subscribe({
      next: () => {
        this.procesandoAcreditacion = false;
        this.mensajeExito = nuevoEstado === 'APROBADO'
          ? this.t().pm_profesional_detalle.exito_aprobar
          : this.t().pm_profesional_detalle.exito_rechazar;
        this.cargarDetalle(idProfesional);
      },
      error: (err) => {
        console.error('Error al resolver la acreditación', err);
        this.procesandoAcreditacion = false;
        this.errorMensaje = this.portalMedicoService.extraerMensajeError(
          err,
          err.status === 403 ? this.t().pm_profesional_detalle.error_permisos : this.t().pm_profesional_detalle.error_resolver
        );
        this.cdr.detectChanges();
      }
    });
  }

  // ---------------------------------------------------------------------
  // Estado de la cuenta
  // ---------------------------------------------------------------------

  abrirBaja(): void {
    this.confirmandoBaja = true;
    this.motivoBaja = '';
    this.errorMensaje = null;
    this.mensajeExito = null;
  }

  cerrarBaja(): void {
    this.confirmandoBaja = false;
    this.motivoBaja = '';
  }

  deshabilitarCuenta(): void {
    if (!this.profesional) return;

    const idProfesional = this.profesional.id_profesional;
    this.procesandoEstado = true;
    this.errorMensaje = null;
    this.mensajeExito = null;

    this.portalMedicoService.deshabilitarProfesional(idProfesional, this.motivoBaja.trim()).subscribe({
      next: (resultado) => {
        this.procesandoEstado = false;
        this.confirmandoBaja = false;
        this.motivoBaja = '';
        // El resumen se muestra tal cual: al administrador le importa saber a
        // cuántos pacientes se les canceló la hora y si les llegó el aviso.
        this.mensajeExito = this.textosService.reemplazarVariables(
          this.t().pm_profesional_detalle.exito_baja,
          {
            citas: resultado.citas_canceladas + '',
            avisados: resultado.pacientes_avisados + '',
            bloques: resultado.bloques_retirados + '',
            planes: resultado.planes_cerrados + ''
          }
        );
        this.cargarDetalle(idProfesional);
      },
      error: (err) => this.manejarErrorEstado(err)
    });
  }

  habilitarCuenta(): void {
    if (!this.profesional) return;
    if (!confirm(this.t().pm_profesional_detalle.confirmar_habilitar)) return;

    const idProfesional = this.profesional.id_profesional;
    this.procesandoEstado = true;
    this.errorMensaje = null;
    this.mensajeExito = null;

    this.portalMedicoService.habilitarProfesional(idProfesional).subscribe({
      next: () => {
        this.procesandoEstado = false;
        this.mensajeExito = this.t().pm_profesional_detalle.exito_habilitar;
        this.cargarDetalle(idProfesional);
      },
      error: (err) => this.manejarErrorEstado(err)
    });
  }

  private manejarErrorEstado(err: any): void {
    this.procesandoEstado = false;
    this.errorMensaje = this.portalMedicoService.extraerMensajeError(
      err,
      err.status === 403
        ? this.t().pm_profesional_detalle.error_permisos
        : this.t().pm_profesional_detalle.error_estado
    );
    this.cdr.detectChanges();
  }

  toggleValidezDocumento(idDocumento: number, esValidoActual: boolean): void {
    this.errorMensaje = null;
    this.mensajeExito = null;
    this.procesandoDocumento = idDocumento;
    const idProfesional = this.profesional!.id_profesional;

    this.portalMedicoService.validarDocumento(idDocumento, !esValidoActual).subscribe({
      next: () => {
        this.procesandoDocumento = null;
        this.mensajeExito = esValidoActual
          ? this.t().pm_profesional_detalle.exito_invalidar
          : this.t().pm_profesional_detalle.exito_validar;
        this.cargarDetalle(idProfesional);
      },
      error: (err) => {
        console.error('Error al validar el documento', err);
        this.procesandoDocumento = null;
        this.errorMensaje = this.portalMedicoService.extraerMensajeError(
          err,
          err.status === 403 ? this.t().pm_profesional_detalle.error_permisos : this.t().pm_profesional_detalle.error_validar
        );
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Abre el documento en el visor sobre la ficha, en vez de saltar a otra
   * pestaña: revisar una acreditacion implica ir y volver entre el respaldo y
   * los datos, y perder la pagina en cada clic hacia mas lento el trabajo.
   *
   * La URL pasa por el sanitizador porque Angular bloquea las URLs dinamicas
   * en [data] de un <object> (las trata como recurso ejecutable). Es seguro:
   * viene del propio backend, no del usuario.
   */
  abrirDocumento(documento: DocumentoRespaldo): void {
    this.documentoAbierto = documento;
    this.urlDocumentoSegura = this.sanitizer.bypassSecurityTrustResourceUrl(
      documento.url_documento_profesional
    );
  }

  cerrarDocumento(): void {
    this.documentoAbierto = null;
    this.urlDocumentoSegura = null;
  }
}
