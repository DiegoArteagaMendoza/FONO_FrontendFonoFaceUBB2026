import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
// 1. Importamos la interfaz Cuidado junto con el servicio
import { CuidadosService, Cuidado } from '@core/services/cuidados/cuidados';
import { TextosService } from '@core/services/textos/textos';
import { obtenerUrlImagen as resolverUrlImagen } from '@core/utils/media-url.util';

@Component({
  selector: 'app-cuidados-cliente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cuidados.html',
  styleUrls: ['./cuidados.scss']
})
export class CuidadosClienteComponent implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  // 2. Usamos la interfaz correcta
  cuidados: Cuidado[] = []; 
  cuidadosFiltrados: Cuidado[] = [];
  cargando = true;
  categoriaActiva = 'TODAS';

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

  obtenerUrlImagen(rutaImagen: string | null): string {
    return resolverUrlImagen(rutaImagen);
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