import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CuidadosService, Cuidado } from '../../../core/services/cuidados/cuidados';

@Component({
  selector: 'app-editar-cuidado',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './editar.html',
  styleUrls: ['./editar.scss']
})
export class EditarCuidado implements OnInit {
  editarForm: FormGroup;
  idCuidado: number = 0;
  isSubmitting = false;
  cargandoDatos = true;
  errorMensaje = '';
  
  // Gestión de la imagen actual y nueva
  imagenActualUrl: string | null = null;
  nuevaImagenSeleccionada: File | null = null;
  public backendUrl = 'http://127.0.0.1:8000';

  constructor(
    private fb: FormBuilder,
    private cuidadosService: CuidadosService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.editarForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(200)]],
      publico: ['', Validators.required],
      contenido: ['', Validators.required],
      fuente: ['', Validators.pattern('https?://.+')]
    });
  }

  ngOnInit(): void {
    // 1. Obtenemos el ID de la ruta
    this.idCuidado = Number(this.route.snapshot.paramMap.get('id'));
    if (this.idCuidado) {
      this.cargarDatosActuales();
    } else {
      this.volver();
    }
  }

  cargarDatosActuales(): void {
    this.cargandoDatos = true;
    this.cuidadosService.getCuidados().subscribe({
      next: (datos) => {
        const cuidadoActual = datos.find(item => item.id_cuidado === this.idCuidado);
        if (cuidadoActual) {
          // Pre-llenamos el formulario con los textos actuales
          this.editarForm.patchValue({
            titulo: cuidadoActual.titulo,
            publico: cuidadoActual.publico,
            contenido: cuidadoActual.contenido,
            fuente: cuidadoActual.fuente
          });
          this.imagenActualUrl = cuidadoActual.img;
          this.cargandoDatos = false;
        } else {
          this.errorMensaje = 'No se encontró el cuidado solicitado.';
          this.cargandoDatos = false;
        }
        this.cdr.detectChanges(); // Forzamos actualización visual inmediata
      },
      error: (err) => {
        console.error('Error al cargar datos actuales', err);
        this.errorMensaje = 'Error al cargar los datos en el servidor.';
        this.cargandoDatos = false;
        this.cdr.detectChanges();
      }
    });
  }

  obtenerUrlImagen(ruta: string | null): string {
    if (!ruta) return '';
    if (ruta.startsWith('http')) return ruta;
    return ruta.startsWith('/') ? this.backendUrl + ruta : `${this.backendUrl}/${ruta}`;
  }

  onFileChange(event: any): void {
    const files: FileList = event.target.files;
    this.errorMensaje = '';
    if (files.length > 0) {
      this.nuevaImagenSeleccionada = files[0];
    } else {
      this.nuevaImagenSeleccionada = null;
    }
    this.cdr.detectChanges();
  }

  onSubmit(): void {
    if (this.editarForm.invalid) {
      this.editarForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMensaje = '';

    // ESTRATEGIA DE ENVÍO DE DATOS SEGÚN LA DOCUMENTACIÓN
    let payload: any;

    if (this.nuevaImagenSeleccionada) {
      // Si se sube una nueva imagen, es obligatorio usar FormData
      const formData = new FormData();
      formData.append('titulo', this.editarForm.get('titulo')?.value);
      formData.append('publico', this.editarForm.get('publico')?.value);
      formData.append('contenido', this.editarForm.get('contenido')?.value);
      
      const fuenteVal = this.editarForm.get('fuente')?.value;
      formData.append('fuente', fuenteVal ? fuenteVal : '');
      formData.append('img', this.nuevaImagenSeleccionada);
      
      payload = formData;
    } else {
      // Si no hay imagen nueva, enviamos un objeto JSON limpio
      payload = this.editarForm.value;
    }

    this.cuidadosService.editarCuidado(this.idCuidado, payload).subscribe({
      next: (respuesta) => {
        console.log('Cuidado actualizado', respuesta);
        this.isSubmitting = false;
        this.volver();
      },
      error: (err) => {
        console.error('Error al editar el cuidado:', err);
        this.isSubmitting = false;

        if (err.status === 400) {
          let mensajes = [];
          for (const campo in err.error) {
            if (err.error.hasOwnProperty(campo)) {
              const errorDelCampo = Array.isArray(err.error[campo]) ? err.error[campo].join(' ') : err.error[campo];
              mensajes.push(`• ${campo.toUpperCase()}: ${errorDelCampo}`);
            }
          }
          this.errorMensaje = 'Errores de validación:\n' + mensajes.join('\n');
        } else if (err.status === 401 || err.status === 403) {
          this.errorMensaje = 'Sesión expirada o permisos insuficientes.';
        } else {
          this.errorMensaje = `Error inesperado (Código ${err.status}).`;
        }
        
        this.cdr.detectChanges(); // Forzamos repintado instantáneo de la alerta
      }
    });
  }

  volver(): void {
    this.router.navigate(['/cuidados']);
  }
}