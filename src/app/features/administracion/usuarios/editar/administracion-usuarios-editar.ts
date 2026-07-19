import { Component, OnInit, ChangeDetectorRef, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { Router, ActivatedRoute, RouterModule } from "@angular/router";
import { AdministracionService } from "../../../../core/services/administracion/administracion";
import { TextosService } from "../../../../core/services/textos/textos";

@Component({
    selector: 'app-editar-usuario',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './administracion-usuarios-editar.html'
})
export class AdministracionUsuarioEditarComponent implements OnInit {
    public textosService = inject(TextosService);
    public t = this.textosService.t;

    editarForm: FormGroup;
    idUsuario: number = 0;
    rutUsuario: string = ''; // Lo usaremos para enviar la petición al backend
    isSubmitting = false;
    cargandoDatos = true;
    errorMensaje = '';

    constructor(
        private fb: FormBuilder,
        private adminService: AdministracionService,
        private router: Router,
        private route: ActivatedRoute,
        private cdr: ChangeDetectorRef
    ) {
        this.editarForm = this.fb.group({
            // La contraseña no es requerida al editar
            password: ['', [Validators.minLength(6)]],
            estado: [true],
            is_staff: [false]
        });
    }

    ngOnInit(): void {
        this.idUsuario = Number(this.route.snapshot.paramMap.get('id'));
        if (this.idUsuario) {
            this.cargarDatosActuales();
        } else {
            this.volver();
        }
    }

    cargarDatosActuales(): void {
        this.cargandoDatos = true;
        this.adminService.getUsuarios().subscribe({
            next: (datos) => {
                const usuarioActual = datos.find(u => u.id_usuario === this.idUsuario);
                if (usuarioActual) {
                    this.rutUsuario = usuarioActual.rut;
                    this.editarForm.patchValue({
                        estado: usuarioActual.estado,
                        is_staff: usuarioActual.is_staff
                    });
                    this.cargandoDatos = false;
                } else {
                    this.errorMensaje = this.t().erorres.error_cargando_datos;
                    this.cargandoDatos = false;
                }
                this.cdr.detectChanges();
            },
            error: (err) => {
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

        const formValues = this.editarForm.value;
        const payload: any = {
            estado: formValues.estado,
            is_staff: formValues.is_staff
        };

        // Solo enviamos el campo password si el administrador escribió algo
        if (formValues.password && formValues.password.trim() !== '') {
            payload.password = formValues.password;
        }

        this.adminService.editarUsuario(this.rutUsuario, payload).subscribe({
            next: (respuesta) => {
                console.log('Usuario actualizado', respuesta);
                this.isSubmitting = false;
                this.volver();
            },
            error: (err) => {
                console.error('Error al editar el usuario:', err);
                this.isSubmitting = false;
                this.errorMensaje = this.t().erorres.error_actualizar;
                this.cdr.detectChanges(); 
            }
        });
    }

    volver(): void {
        this.router.navigate(['/administracion/usuario']);
    }
}