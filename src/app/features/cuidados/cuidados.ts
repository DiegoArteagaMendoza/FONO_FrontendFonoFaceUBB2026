import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CuidadosService, Cuidado } from '../../core/services/cuidados/cuidados';
import { TextosService } from '../../core/services/textos/textos';

@Component({
  selector: 'app-cuidados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cuidados.html',
  // styleUrls: ['./cuidados.scss'] // O comentado si usas el global
})
export class Cuidados implements OnInit {
  // 1. Inyectamos el servicio de textos
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  listaCuidados: Cuidado[] = [];
  cargando = true;
  itemSeleccionado: Cuidado | null = null;
  public backendUrl = 'http://127.0.0.1:8000';
  
  publicoActual: string = '';

  constructor(
    private cuidadosService: CuidadosService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;

    const peticion = this.publicoActual 
      ? this.cuidadosService.getCuidadosPorPublico(this.publicoActual)
      : this.cuidadosService.getCuidados();

    peticion.subscribe({
      next: (datos) => {
        this.listaCuidados = datos.filter(item => item.estado);
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar los cuidados', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  filtrarPorPublico(event: any): void {
    this.publicoActual = event.target.value;
    this.cargarDatos(); 
  }

  obtenerUrlImagen(rutaImagen: string | null): string {
    if (!rutaImagen) return '';
    if (rutaImagen.startsWith('http')) return rutaImagen;
    return rutaImagen.startsWith('/') ? this.backendUrl + rutaImagen : `${this.backendUrl}/${rutaImagen}`;
  }

  irACrear(): void {
    this.router.navigate(['/cuidados/crear']);
  }

  editarCuidado(id: number): void {
    this.router.navigate(['/cuidados/editar', id]);
  }

  eliminarCuidado(id: number): void {
    // 2. Usamos el texto de confirmación global
    const confirmar = confirm(this.t().globales.confirmacion_eliminar);
    if (!confirmar) return;

    this.cuidadosService.eliminarCuidado(id).subscribe({
      next: (respuesta) => {
        console.log('Cuidado eliminado', respuesta);
        this.listaCuidados = this.listaCuidados.filter(item => item.id_cuidado !== id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al eliminar', err);
        // 3. Usamos el texto de error de eliminación
        alert(this.t().erorres.error_eliminacion);
      }
    });
  }
  
  verDetalle(item: Cuidado): void {
    this.itemSeleccionado = item;
    this.cdr.detectChanges(); 
  }

  cerrarDetalle(): void {
    this.itemSeleccionado = null;
    this.cdr.detectChanges();
  }

  getBadgeClass(publico: string): string {
    const map: any = {
      'NIÑOS': 'badge-ninos',
      'PROFESORES': 'badge-profesores',
      'CANTANTES_ACTORES': 'badge-cantantes',
      'LOCUTORES': 'badge-locutores',
      'PUBLICO_GENERAL': 'badge-general'
    };
    return map[publico] || 'badge-default';
  }
}