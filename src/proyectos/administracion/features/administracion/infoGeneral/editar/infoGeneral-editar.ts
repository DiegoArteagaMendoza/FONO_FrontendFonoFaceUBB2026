import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AdministracionService } from '@core/services/administracion/administracion';
import { TextosService } from '@core/services/textos/textos';

@Component({
  selector: 'app-info-general-editar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './infoGeneral-editar.html'
})
export class AdministracionInfoGeneralEditarComponent implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  editarForm: FormGroup;
  idInfo: number = 0;
  isSubmitting = false;
  cargandoDatos = true;
  errorMensaje = '';

  // Sección y clave no se editan: se conservan las del registro y se reenvían al guardar.
  private seccionActual = '';
  private claveActual = '';

  constructor(
    private fb: FormBuilder,
    private adminService: AdministracionService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.editarForm = this.fb.group({
      titulo: ['', [Validators.maxLength(150)]],
      descripcion: [''],
      enlace: ['', [Validators.maxLength(255)]],
      estado: [true] 
    });
  }

  ngOnInit(): void {
    this.idInfo = Number(this.route.snapshot.paramMap.get('id'));
    if (this.idInfo) {
      this.cargarDatosActuales();
    } else {
      this.volver();
    }
  }

  cargarDatosActuales(): void {
    this.cargandoDatos = true;
    this.adminService.getInfoGeneralListarAdmin().subscribe({
      next: (datos: any[]) => {
        const infoActual = datos.find(item => item.id_info === this.idInfo);
        if (infoActual) {
          this.seccionActual = infoActual.seccion;
          this.claveActual = infoActual.clave;
          this.editarForm.patchValue({
            titulo: infoActual.titulo,
            descripcion: infoActual.descripcion,
            enlace: infoActual.enlace,
            estado: infoActual.estado
          });
          this.cargandoDatos = false;
        } else {
          this.errorMensaje = this.t().erorres.error_cargando_datos;
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

  onSubmit(): void {
    if (this.editarForm.invalid) {
      this.editarForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMensaje = '';

    const payload = {
      ...this.editarForm.value,
      seccion: this.seccionActual,
      clave: this.claveActual
    };

    this.adminService.editarInfoGeneral(this.idInfo, payload).subscribe({
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
    this.router.navigate(['/administracion/informacion/inicio']);
  }
}