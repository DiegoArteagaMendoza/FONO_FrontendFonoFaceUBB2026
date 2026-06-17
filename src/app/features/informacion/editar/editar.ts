import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { InformacionService, Informacion, ImagenInformacion } from '../../../core/services/informacion/informacion';

@Component({
  selector: 'app-editar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './editar.html',
  styleUrls: ['./editar.scss']
})
export class EditarInformacion implements OnInit {
  editarForm: FormGroup;
  idInformacion: number = 0;
  isSubmitting = false;
  cargandoDatos = true;
  errorMensaje = '';
  
  // Nuevas variables para las imágenes
  imagenesActuales: ImagenInformacion[] = [];
  public backendUrl = 'http://127.0.0.1:8000';

  constructor(
    private fb: FormBuilder,
    private informacionService: InformacionService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.editarForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(200)]],
      categoria: ['', Validators.required],
      contenido: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.idInformacion = Number(this.route.snapshot.paramMap.get('id'));
    if (this.idInformacion) {
      this.cargarDatosActuales();
    } else {
      this.volver();
    }
  }

  cargarDatosActuales(): void {
    this.cargandoDatos = true;
    
    this.informacionService.getInformacion().subscribe({
      next: (datos) => {
        const infoActual = datos.find(item => item.id_informacion === this.idInformacion);
        if (infoActual) {
          this.editarForm.patchValue({
            titulo: infoActual.titulo,
            categoria: infoActual.categoria,
            contenido: infoActual.contenido
          });
          // Guardamos las imágenes para mostrarlas
          this.imagenesActuales = infoActual.imagenes || [];
          this.cargandoDatos = false;
        } else {
          this.errorMensaje = 'No se encontró la información solicitada.';
          this.cargandoDatos = false;
        }
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Error al cargar datos', err);
        this.errorMensaje = 'Error al cargar los datos actuales.';
        this.cargandoDatos = false;
        this.cdr.detectChanges(); 
      }
    });
  }

  // Método para obtener la URL correcta de la imagen
  obtenerUrlImagen(rutaImagen: string): string {
    if (!rutaImagen) return '';
    if (rutaImagen.startsWith('http')) return rutaImagen;
    return rutaImagen.startsWith('/') ? this.backendUrl + rutaImagen : `${this.backendUrl}/${rutaImagen}`;
  }

  // Lógica preparada para eliminar la imagen
  eliminarImagen(idImagen: number): void {
    const confirmar = confirm('¿Estás seguro de que deseas eliminar esta imagen? Esta acción no se puede deshacer.');
    
    if (confirmar) {
      console.log('Solicitando eliminar la imagen con ID:', idImagen);
      
      // AQUI IRÁ LA LLAMADA A TU SERVICIO (Ejemplo comentado)
      /*
      this.informacionService.eliminarImagen(idImagen).subscribe({
        next: () => {
          // Filtramos la imagen borrada del arreglo para que desaparezca de la vista sin recargar
          this.imagenesActuales = this.imagenesActuales.filter(img => img.id !== idImagen);
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error al eliminar imagen', err)
      });
      */
      
      // Simulamos la eliminación visual por ahora:
      this.imagenesActuales = this.imagenesActuales.filter(img => img.id !== idImagen);
      this.cdr.detectChanges();
    }
  }

  onSubmit(): void {
    if (this.editarForm.invalid) {
      this.editarForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMensaje = '';
    const datosActualizados = this.editarForm.value;

    this.informacionService.editarInformacion(this.idInformacion, datosActualizados).subscribe({
      next: (respuesta) => {
        console.log('Información actualizada', respuesta);
        this.isSubmitting = false;
        this.volver();
      },
      error: (err) => {
        console.error('Error al editar', err);
        this.isSubmitting = false;
        this.errorMensaje = 'Ocurrió un error al actualizar. Verifica tus permisos o sesión.';
        this.cdr.detectChanges();
      }
    });
  }

  volver(): void {
    this.router.navigate(['/informacion']);
  }
}