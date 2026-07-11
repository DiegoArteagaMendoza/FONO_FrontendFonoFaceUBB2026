import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdministracionService, UsuarioItem } from '../../../core/services/administracion/administracion';
// Inject the service
import { TextosService } from '../../../core/services/textos/textos';

@Component({
    selector: 'app-administracion',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './administracion-usuarios.html',
    // styleUrls: ['./administracion-usuarios.scss'] // Assuming global styles are used
})
export class AdministracionUsuarioComponent implements OnInit {
    // Expose the signal
    public textosService = inject(TextosService);
    public t = this.textosService.t;

    listaUsuarios: UsuarioItem[] = [];
    cargando = true;
    itemSeleccionado: UsuarioItem | null = null;
    public backendUrl = 'http://127.0.0.1:8000';

    constructor(
        private adminService: AdministracionService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.cargarDatos();
    }

    cargarDatos(): void {
        this.cargando = true;
        this.adminService.getUsuarios().subscribe({
            next: (datos) => {
                this.listaUsuarios = datos;
                this.cargando = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error al cargar los usuarios', err);
                this.cargando = false;
                this.cdr.detectChanges();
            }
        });
    }

    irAcrear(): void {
        this.router.navigate(['/administracion/usuario/crear']);
    }

    editarUsuario(id: number | undefined): void {
        if (id) {
            this.router.navigate(['/administracion/usuario/editar', id]);
        }
    }

    eliminarUsuario(rut: string): void {
        // Use the global text for the confirmation message
        const confirmar = confirm(this.t().globales.confirmacion_eliminar);
        
        if (!confirmar) {
            return; 
        }

        this.adminService.eliminarUsuario(rut).subscribe({
            next: (respuesta) => {
                console.log('Respuesta del servidor:', respuesta);
                this.listaUsuarios = this.listaUsuarios.filter(item => item.rut !== rut);
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error al intentar eliminar el registro:', err);
                // Use the global error message
                alert(this.t().erorres.error_eliminacion);
            }
        });
    }

    verDetalle(item: UsuarioItem): void {
        this.itemSeleccionado = item;
        this.cdr.detectChanges(); 
    }

    cerrarDetalle(): void {
        this.itemSeleccionado = null;
        this.cdr.detectChanges();
    }
}