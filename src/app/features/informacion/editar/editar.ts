import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 1. Importa ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { InformacionService, Informacion } from '../../../core/services/informacion/informacion';

@Component({
  selector: 'app-editar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './editar.html',
  styleUrls: ['./editar.scss']
})
export class Editar implements OnInit {
  editarForm: FormGroup;
  idInformacion: number = 0;
  isSubmitting = false;
  cargandoDatos = true;
  errorMensaje = '';

  constructor(
    private fb: FormBuilder,
    private informacionService: InformacionService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef // 2. Inyéctalo aquí en el constructor
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
          this.cargandoDatos = false;
        } else {
          this.errorMensaje = 'No se encontró la información solicitada.';
          this.cargandoDatos = false;
        }
        
        // 3. Forzamos a Angular a ocultar el "Cargando..." y renderizar el formulario
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Error al cargar datos', err);
        this.errorMensaje = 'Error al cargar los datos actuales.';
        this.cargandoDatos = false;
        
        // También forzamos la actualización en caso de error para mostrar la alerta
        this.cdr.detectChanges(); 
      }
    });
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