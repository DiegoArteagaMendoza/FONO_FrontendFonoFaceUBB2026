import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PortalMedicoService, DocumentoRespaldo, TipoDocumento } from '@core/services/portal-medico/portal-medico';
import { TextosService } from '@core/services/textos/textos';

@Component({
  selector: 'app-pm-documentos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './documentos.html'
})
export class PortalMedicoDocumentosComponent implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  documentos: DocumentoRespaldo[] = [];
  cargando = true;

  tiposDocumento: TipoDocumento[] = ['CEDULA_IDENTIDAD', 'CERTIFICADO_TITULO', 'CERTIFICADO_SUPERINTENDENCIA'];

  formulario: FormGroup;
  archivoSeleccionado: File | null = null;
  subiendo = false;
  errorMensaje: string | null = null;
  mensajeExito: string | null = null;

  constructor(
    private fb: FormBuilder,
    private portalMedicoService: PortalMedicoService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.formulario = this.fb.group({
      tipo_documeto_profesional: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (!this.portalMedicoService.estaAutenticadoComoProfesional()) {
      this.router.navigate(['/portalmedico/login']);
      return;
    }
    this.cargarPerfilDocumentos();
  }

  cargarPerfilDocumentos(): void {
    this.cargando = true;
    this.portalMedicoService.getPerfil().subscribe({
      next: (perfil) => {
        this.documentos = perfil.documentos;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar los documentos', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  onFileChange(event: any): void {
    const files: FileList = event.target.files;
    this.archivoSeleccionado = files.length > 0 ? files[0] : null;
  }

  onSubmit(): void {
    this.errorMensaje = null;
    this.mensajeExito = null;

    if (this.formulario.invalid || !this.archivoSeleccionado) {
      this.formulario.markAllAsTouched();
      if (!this.archivoSeleccionado) {
        this.errorMensaje = this.t().pm_documentos.alerta_archivo;
      }
      return;
    }

    this.subiendo = true;

    const formData = new FormData();
    formData.append('tipo_documeto_profesional', this.formulario.get('tipo_documeto_profesional')?.value);
    formData.append('url_documento_profesional', this.archivoSeleccionado);

    this.portalMedicoService.subirDocumento(formData).subscribe({
      next: (documento) => {
        this.documentos = [documento, ...this.documentos];
        this.subiendo = false;
        this.mensajeExito = this.t().pm_documentos.exito_subir;
        this.formulario.reset();
        this.archivoSeleccionado = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al subir el documento', err);
        this.subiendo = false;
        this.errorMensaje = this.portalMedicoService.extraerMensajeError(err, this.t().pm_documentos.error_subir);
        this.cdr.detectChanges();
      }
    });
  }

  eliminarDocumento(idDocumento: number): void {
    const confirmar = confirm(this.t().pm_documentos.confirmar_eliminar);
    if (!confirmar) return;

    this.errorMensaje = null;
    this.mensajeExito = null;

    this.portalMedicoService.eliminarDocumento(idDocumento).subscribe({
      next: () => {
        this.documentos = this.documentos.filter(d => d.id_documento !== idDocumento);
        this.mensajeExito = this.t().pm_documentos.exito_eliminar;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al eliminar el documento', err);
        this.errorMensaje = this.portalMedicoService.extraerMensajeError(err, this.t().pm_documentos.error_eliminar);
        this.cdr.detectChanges();
      }
    });
  }
}
