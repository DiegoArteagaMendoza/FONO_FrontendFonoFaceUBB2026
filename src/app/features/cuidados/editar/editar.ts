import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CuidadosService, Cuidado } from '../../../core/services/cuidados/cuidados';
import { TextosService } from '../../../core/services/textos/textos';

@Component({
  selector: 'app-editar-cuidado',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './editar.html',
  // styleUrls: ['./editar.scss'] // O comentado si usas el global
})
export class EditarCuidado implements OnInit {
  // 1. Inyectamos el servicio de textos
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  editarForm: FormGroup;
  idCuidado: number = 0;
  isSubmitting = false;
  cargandoDatos = true;
  errorMensaje = '';
  
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
          this.editarForm.patchValue({
            titulo: cuidadoActual.titulo,
            publico: cuidadoActual.publico,
            contenido: cuidadoActual.contenido,
            fuente: cuidadoActual.fuente
          });
          this.imagenActualUrl = cuidadoActual.img;
          this.cargandoDatos = false;
        } else {
          // 2. Usamos el texto de error "no encontrado"
          this.errorMensaje = this.t().edicion_cuidados.error_no_encontrado;
          this.cargandoDatos = false;
        }
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Error al cargar datos actuales', err);
        // 3. Usamos el texto "error cargando datos"
        this.errorMensaje = this.t().erorres.error_cargando_datos;
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

    let payload: any;

    if (this.nuevaImagenSeleccionada) {
      const formData = new FormData();
      formData.append('titulo', this.editarForm.get('titulo')?.value);
      formData.append('publico', this.editarForm.get('publico')?.value);
      formData.append('contenido', this.editarForm.get('contenido')?.value);
      
      const fuenteVal = this.editarForm.get('fuente')?.value;
      formData.append('fuente', fuenteVal ? fuenteVal : '');
      formData.append('img', this.nuevaImagenSeleccionada);
      
      payload = formData;
    } else {
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

        // Formateo de errores
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
        
        this.cdr.detectChanges(); 
      }
    });
  }

  volver(): void {
    this.router.navigate(['/cuidados']);
  }
}