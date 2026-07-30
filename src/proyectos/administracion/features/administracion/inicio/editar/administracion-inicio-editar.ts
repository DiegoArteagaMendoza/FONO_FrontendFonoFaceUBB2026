import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AdministracionService } from '@core/services/administracion/administracion';
import { TextosService } from '@core/services/textos/textos';

@Component({
  selector: 'app-editar-inicio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './administracion-inicio-editar.html',
  // styleUrls: ['./administracion-inicio-editar.scss'] // Comentado si usas clases globales
})
export class AdministracionInicioEditarComponent implements OnInit {
  // Inyectamos el servicio de textos
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  editarForm: FormGroup;
  idBanner: number = 0;
  isSubmitting = false;
  cargandoDatos = true;
  errorMensaje = '';

  imagenActualUrl: string | null = null;
  nuevaImagenSeleccionada: File | null = null;
  public backendUrl = 'http://127.0.0.1:8000';

  constructor(
    private fb: FormBuilder,
    private adminService: AdministracionService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.editarForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.maxLength(250)]]
    });
  }

  ngOnInit(): void {
    this.idBanner = Number(this.route.snapshot.paramMap.get('id'));
    if (this.idBanner) {
      this.cargarDatosActuales();
    } else {
      this.volver();
    }
  }

  cargarDatosActuales(): void {
    this.cargandoDatos = true;
    this.adminService.getInicio().subscribe({
      next: (datos) => {
        const itemActual = datos.find(item => item.id_banner === this.idBanner);
        
        if (itemActual) {
          this.editarForm.patchValue({
            titulo: itemActual.titulo,
            descripcion: itemActual.descripcion
          });
          
          // Verificamos si la imagen viene en el arreglo "imagenes"
          if (itemActual.imagenes && itemActual.imagenes.length > 0) {
            this.imagenActualUrl = itemActual.imagenes[0].imagen;
          }
          
          this.cargandoDatos = false;
        } else {
          this.errorMensaje = this.t().edicion_carrusel.error_no_encontrado;
          this.cargandoDatos = false;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar datos actuales', err);
        this.errorMensaje = this.t().erorres.error_cargando_datos;
        this.cargandoDatos = false;
        this.cdr.detectChanges();
      }
    });
  }

  obtenerUrlImagen(ruta: string | null): string {
    if (!ruta) return '';
    if (ruta.startsWith('http')) return ruta;
    if (!ruta.includes('/media/')) {
      const limpia = ruta.startsWith('/') ? ruta.slice(1) : ruta;
      return `${this.backendUrl}/media/${limpia}`;
    }
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

    const formData = new FormData();
    formData.append('titulo', this.editarForm.get('titulo')?.value);
    formData.append('descripcion', this.editarForm.get('descripcion')?.value);

    // Solo adjuntamos la imagen si el usuario seleccionó una nueva para reemplazarla
    if (this.nuevaImagenSeleccionada) {
      formData.append('imagenes_subidas', this.nuevaImagenSeleccionada);
    }

    // Asegúrate de tener el método editarInicio() configurado en AdministracionService
    this.adminService.editarInicio(this.idBanner, formData).subscribe({
      next: (respuesta) => {
        this.isSubmitting = false;
        this.volver();
      },
      error: (err) => {
        console.error('Error al editar:', err);
        this.isSubmitting = false;
        this.errorMensaje = this.t().erorres.error_actualizar;
        this.cdr.detectChanges();
      }
    });
  }

  volver(): void {
    this.router.navigate(['/administracion/inicio']);
  }
}