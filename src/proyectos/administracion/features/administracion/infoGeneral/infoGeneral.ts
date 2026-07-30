import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AdministracionService, InfoGeneralItem } from '@core/services/administracion/administracion';
import { TextosService } from '@core/services/textos/textos';

@Component({
  selector: 'app-info-general',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './infoGeneral.html'
  // styleUrls: ['./infoGeneral.scss'] // Desactivado para usar estilos globales
})
export class AdministracionInformacionGeneralComponent implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  listaOriginal: InfoGeneralItem[] = [];
  listaFiltrada: InfoGeneralItem[] = [];
  seccionesUnicas: string[] = [];
  
  cargando = true;
  filtroActual = 'todas';
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
        this.listaOriginal = datos;
        
        // Extraemos las secciones únicas para el filtro
        this.seccionesUnicas = [...new Set(datos.map(item => item.seccion))];
        
        this.aplicarFiltro();
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

  alCambiarFiltro(event: any): void {
    this.filtroActual = event.target.value;
    this.aplicarFiltro();
  }

  aplicarFiltro(): void {
    if (this.filtroActual === 'todas') {
      this.listaFiltrada = [...this.listaOriginal];
    } else {
      this.listaFiltrada = this.listaOriginal.filter(item => item.seccion === this.filtroActual);
    }
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
          this.listaOriginal = this.listaOriginal.map(item => {
            if (item.id_info === id) {
              return { ...item, estado: false };
            }
            return item;
          });
          this.aplicarFiltro();
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