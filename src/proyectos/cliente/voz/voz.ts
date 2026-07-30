import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { VozService, Voz } from '@core/services/voz/voz';
import { TextosService } from '@core/services/textos/textos';

@Component({
  selector: 'app-voz-cliente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './voz.html',
  styleUrls: ['./voz.scss']
})
export class VozClienteComponent implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  voz: Voz[] = [];
  vozFiltrada: Voz[] = [];
  cargando = true;
  categoriaActiva = 'TODAS';

  public backendUrl = 'http://127.0.0.1:8000';

  categorias = [
    { id: 'TODAS', nombre: 'Todas' },
    { id: 'DEFINICION', nombre: 'Definición' },
    { id: 'ANATOMIA', nombre: 'Anatomía' },
    { id: 'FISIOLOGIA', nombre: 'Fisiología' },
    { id: 'TRASTORNOS', nombre: 'Trastornos de la Voz' },
    { id: 'IMPORTANCIA', nombre: 'Importancia del Cuidado' },
    { id: 'CURIOSIDADES', nombre: 'Curiosidades' }
  ];

  constructor(
    private vozService: VozService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarVoz();
  }

  cargarVoz(): void {
    this.cargando = true;
    this.vozService.getVoz().subscribe({
      next: (datos) => {
        // Filtramos solo el contenido activo
        this.voz = datos.filter(item => item.estado);
        this.vozFiltrada = [...this.voz];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar el contenido de voz', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  filtrarPorCategoria(categoriaId: string): void {
    this.categoriaActiva = categoriaId;
    if (categoriaId === 'TODAS') {
      this.vozFiltrada = [...this.voz];
    } else {
      this.vozFiltrada = this.voz.filter(item => item.categoria === categoriaId);
    }
    this.cdr.detectChanges();
  }

  // Método de imagen con soporte para /media/
  obtenerUrlImagen(rutaImagen: string | null): string {
    if (!rutaImagen) return '';
    if (rutaImagen.startsWith('http')) return rutaImagen;

    // Si la ruta no incluye '/media/', se lo agregamos
    if (!rutaImagen.includes('/media/')) {
      const limpia = rutaImagen.startsWith('/') ? rutaImagen.slice(1) : rutaImagen;
      return `${this.backendUrl}/media/${limpia}`;
    }

    return rutaImagen.startsWith('/') ? this.backendUrl + rutaImagen : `${this.backendUrl}/${rutaImagen}`;
  }

  obtenerNombreCategoria(id: string): string {
    const cat = this.categorias.find(c => c.id === id);
    return cat ? cat.nombre : 'General';
  }

  // Helper para asignar colores a la clase CSS igual que en admin
  getBadgeClass(categoria: string): string {
    const map: any = {
      'DEFINICION': 'DE',
      'ANATOMIA': 'AN',
      'FISIOLOGIA': 'FI',
      'TRASTORNOS': 'TR',
      'IMPORTANCIA': 'IM',
      'CURIOSIDADES': 'CU'
    };
    return map[categoria] || 'DE';
  }

  verDetalle(idVoz: number): void {
    this.router.navigate(['/portal/lavoz', idVoz]);
  }
}
