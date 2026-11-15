import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AdministracionService, InfoGeneralItem } from '@core/services/administracion/administracion';
import { TextosService } from '@core/services/textos/textos';
import { TablaResponsivaDirective } from '@core/directives/tabla-responsiva.directive';

@Component({
  selector: 'app-info-general',
  standalone: true,
  imports: [CommonModule, RouterModule, TablaResponsivaDirective],
  templateUrl: './infoGeneral.html'
  // styleUrls: ['./infoGeneral.scss'] // Desactivado para usar estilos globales
})
export class AdministracionInformacionGeneralComponent implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  lista: InfoGeneralItem[] = [];
  mostrarInactivos = false;

  cargando = true;
  itemSeleccionado: InfoGeneralItem | null = null;

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
    this.adminService.getInfoGeneralListarAdmin().subscribe({
      next: (datos) => {
        this.lista = datos;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar información general', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  /** Por defecto solo los activos; los inactivos se ven al marcar "Mostrar elementos inactivos". */
  get listaVisible(): InfoGeneralItem[] {
    return this.mostrarInactivos ? this.lista : this.lista.filter(item => item.estado);
  }

  alternarInactivos(event: Event): void {
    this.mostrarInactivos = (event.target as HTMLInputElement).checked;
    this.cdr.detectChanges();
  }

  irACrear(): void {
    this.router.navigate(['/administracion/informacion/inicio/crear']);
  }

  editarItem(id: number): void {
    this.router.navigate(['/administracion/informacion/inicio/editar', id]);
  }

  eliminarItem(id: number | undefined): void {
    if (!id) return;
    
    if (confirm(this.t().globales.confirmacion_eliminar)) {
      this.adminService.eliminarInfoGeneral(id).subscribe({
        next: () => {
          // Borrado lógico visual
          this.lista = this.lista.map(item => {
            if (item.id_info === id) {
              return { ...item, estado: false };
            }
            return item;
          });
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al eliminar', err);
          alert(this.t().erorres.error_eliminacion);
        }
      });
    }
  }

  // --- MÉTODOS DEL MODAL ---
  verDetalle(item: InfoGeneralItem): void {
    this.itemSeleccionado = item;
    this.cdr.detectChanges(); 
  }

  cerrarDetalle(): void {
    this.itemSeleccionado = null;
    this.cdr.detectChanges();
  }
}