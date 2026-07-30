import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdministracionService, UsuarioItem } from '@core/services/administracion/administracion';
import { TextosService } from '@core/services/textos/textos';

@Component({
    selector: 'app-administracion',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './administracion-usuarios.html'
})
export class AdministracionUsuarioComponent implements OnInit {
    public textosService = inject(TextosService);
    public t = this.textosService.t;

    listaUsuarios: UsuarioItem[] = []; // Lista original intacta
    usuariosFiltrados: UsuarioItem[] = []; // Lista que se muestra en pantalla
    
    cargando = true;
    itemSeleccionado: UsuarioItem | null = null;
    public backendUrl = 'http://127.0.0.1:8000';
    
    filtroEstado: string = 'todos'; // Valor por defecto del select

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
                this.aplicarFiltro(); // Filtramos inmediatamente al cargar
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

    // Captura el cambio en el selector (select)
    alCambiarFiltro(event: any): void {
        this.filtroEstado = event.target.value;
        this.aplicarFiltro();
    }

    // Lógica para filtrar la lista visual
    aplicarFiltro(): void {
        if (this.filtroEstado === 'activos') {
            this.usuariosFiltrados = this.listaUsuarios.filter(u => u.estado === true);
        } else if (this.filtroEstado === 'inactivos') {
            this.usuariosFiltrados = this.listaUsuarios.filter(u => u.estado === false);
        } else {
            this.usuariosFiltrados = [...this.listaUsuarios]; // Muestra todos
        }
        this.cdr.detectChanges();
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
        const confirmar = confirm(this.t().globales.confirmacion_eliminar);
        if (!confirmar) return; 

        this.adminService.eliminarUsuario(rut).subscribe({
            next: (respuesta) => {
                // En vez de borrarlo de la lista, cambiamos su estado localmente a false
                // para que refleje el borrado lógico del backend de forma instantánea.
                this.listaUsuarios = this.listaUsuarios.map(item => {
                    if (item.rut === rut) {
                        return { ...item, estado: false };
                    }
                    return item;
                });
                
                // Re-aplicamos el filtro (si estabas viendo solo activos, desaparecerá de la vista)
                this.aplicarFiltro();
            },
            error: (err) => {
                console.error('Error al intentar eliminar el registro:', err);
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