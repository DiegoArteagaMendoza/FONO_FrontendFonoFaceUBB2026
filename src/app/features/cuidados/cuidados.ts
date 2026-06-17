import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CuidadosService, Cuidado } from '../../core/services/cuidados/cuidados';

@Component({
  selector: 'app-cuidados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cuidados.html',
  styleUrls: ['./cuidados.scss']
})
export class Cuidados implements OnInit {
  listaCuidados: Cuidado[] = [];
  cargando = true;
  itemSeleccionado: Cuidado | null = null;
  public backendUrl = 'http://127.0.0.1:8000';
  
  // Variable para el filtro por Público
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

    // Dependiendo de si hay un filtro seleccionado, llamamos a un endpoint u otro
    const peticion = this.publicoActual 
      ? this.cuidadosService.getCuidadosPorPublico(this.publicoActual)
      : this.cuidadosService.getCuidados();

    peticion.subscribe({
      next: (datos) => {
        // Filtramos solo los que tienen estado true (borrado lógico)
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

  // --- MÉTODOS DE ACCIÓN ---

  irACrear(): void {
    this.router.navigate(['/cuidados/crear']);
  }

  editarCuidado(id: number): void {
    this.router.navigate(['/cuidados/editar', id]);
  }

  eliminarCuidado(id: number): void {
    const confirmar = confirm('¿Estás seguro de que deseas eliminar este cuidado?');
    if (!confirmar) return;

    this.cuidadosService.eliminarCuidado(id).subscribe({
      next: (respuesta) => {
        console.log('Cuidado eliminado', respuesta);
        this.listaCuidados = this.listaCuidados.filter(item => item.id_cuidado !== id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al eliminar', err);
        alert('Ocurrió un error al eliminar el cuidado.');
      }
    });
  }
  
  // --- MÉTODOS DEL MODAL ---

  verDetalle(item: Cuidado): void {
    this.itemSeleccionado = item;
    this.cdr.detectChanges(); 
  }

  cerrarDetalle(): void {
    this.itemSeleccionado = null;
    this.cdr.detectChanges();
  }

  // Método auxiliar para evitar problemas con la "Ñ" en las clases CSS
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