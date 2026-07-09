import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdministracionService, UsuarioItem } from '../../../core/services/administracion/administracion';

@Component({
    selector: 'app-administracion',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './administracion-usuarios.html',
    styleUrls: ['./administracion-usuarios.scss'] // Asegúrate de tener los mismos estilos de modal que en Información
})
export class AdministracionUsuarioComponent implements OnInit {
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

    // Navega a la vista de edición enviando el id del usuario
    editarUsuario(id: number | undefined): void {
        if (id) {
            this.router.navigate(['/administracion/usuario/editar', id]);
        }
    }

    // Eliminamos utilizando el RUT (como lo definiste en tus URLs de Django)
    eliminarUsuario(rut: string): void {
        const confirmar = confirm('¿Estás seguro de que deseas desactivar a este usuario? Esta acción le impedirá iniciar sesión.');
        
        if (!confirmar) {
            return; 
        }

        this.adminService.eliminarUsuario(rut).subscribe({
            next: (respuesta) => {
                console.log('Respuesta del servidor:', respuesta);
                
                // Filtramos la lista local para que el usuario desaparezca de la tabla
                this.listaUsuarios = this.listaUsuarios.filter(item => item.rut !== rut);
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error al intentar eliminar el registro:', err);
                alert('Ocurrió un error al eliminar al usuario. Por favor, verifica tus permisos o vuelve a iniciar sesión.');
            }
        });
    }

    // Control del Modal
    verDetalle(item: UsuarioItem): void {
        this.itemSeleccionado = item;
        this.cdr.detectChanges(); 
    }

    cerrarDetalle(): void {
        this.itemSeleccionado = null;
        this.cdr.detectChanges();
    }
}