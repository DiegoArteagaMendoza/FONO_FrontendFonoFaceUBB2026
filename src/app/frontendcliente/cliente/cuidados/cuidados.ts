import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
// 1. Importamos la interfaz Cuidado junto con el servicio
import { CuidadosService, Cuidado } from '../../../core/services/cuidados/cuidados';

@Component({
  selector: 'app-cuidados-cliente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cuidados.html',
  styleUrls: ['./cuidados.scss']
})
export class CuidadosClienteComponent implements OnInit {
  // 2. Usamos la interfaz correcta
  cuidados: Cuidado[] = []; 
  cuidadosFiltrados: Cuidado[] = [];
  cargando = true;
  categoriaActiva = 'TODAS';
  
  public backendUrl = 'http://127.0.0.1:8000';

  // 3. Ajustamos los IDs para que coincidan EXACTAMENTE con el 'publico' de la BD
  categorias = [
    { id: 'TODAS', nombre: 'Todos los perfiles' },
    { id: 'NIÑOS', nombre: 'Niños' },
    { id: 'PROFESORES', nombre: 'Profesores' },
    { id: 'CANTANTES_ACTORES', nombre: 'Cantantes y Actores' },
    { id: 'LOCUTORES', nombre: 'Locutores' },
    { id: 'PUBLICO_GENERAL', nombre: 'Público General' }
  ];

  constructor(
    private cuidadosService: CuidadosService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarCuidados();
  }

  cargarCuidados(): void {
    this.cargando = true;
    this.cuidadosService.getCuidados().subscribe({
      next: (datos) => {
        // Filtramos solo los cuidados activos
        this.cuidados = datos.filter(item => item.estado);
        this.cuidadosFiltrados = [...this.cuidados];
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

  filtrarPorCategoria(categoriaId: string): void {
    this.categoriaActiva = categoriaId;
    if (categoriaId === 'TODAS') {
      this.cuidadosFiltrados = [...this.cuidados];
    } else {
      // 4. Comparamos contra item.publico, no item.categoria
      this.cuidadosFiltrados = this.cuidados.filter(item => item.publico === categoriaId);
    }
    this.cdr.detectChanges();
  }

  // 5. Método de imagen mejorado con soporte para /media/
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
  getBadgeClass(publico: string): string {
    const map: any = {
      'NIÑOS': 'NI',
      'PROFESORES': 'PO',
      'CANTANTES_ACTORES': 'CA',
      'LOCUTORES': 'LO',
      'PUBLICO_GENERAL': 'GE'
    };
    return map[publico] || 'GE';
  }

  verDetalle(idCuidado: number): void {
    this.router.navigate(['/portal/cuidados', idCuidado]);
  }
}