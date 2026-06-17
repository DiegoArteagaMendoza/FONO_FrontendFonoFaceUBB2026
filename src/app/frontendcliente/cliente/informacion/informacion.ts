import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // 1. Importar Router
import { InformacionService, Informacion } from '../../../core/services/informacion/informacion';

@Component({
  selector: 'app-informacion-cliente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './informacion.html',
  styleUrls: ['./informacion.scss']
})
export class InformacionClienteComponent implements OnInit {
  articulos: Informacion[] = [];
  articulosFiltrados: Informacion[] = [];
  cargando = true;
  categoriaActiva = 'TODAS';
  
  public backendUrl = 'http://127.0.0.1:8000';

  categorias = [
    { id: 'TODAS', nombre: 'Todas las áreas' },
    { id: 'NI', nombre: 'Niños' },
    { id: 'PO', nombre: 'Profesores' },
    { id: 'CA', nombre: 'Cantantes y Actores' },
    { id: 'LO', nombre: 'Locutores' },
    { id: 'GE', nombre: 'Público General' }
  ];

  constructor(
    private informacionService: InformacionService,
    private cdr: ChangeDetectorRef,
    private router: Router // 2. Inyectar Router
  ) {}

  ngOnInit(): void {
    this.cargarArticulos();
  }

  cargarArticulos(): void {
    this.cargando = true;
    this.informacionService.getInformacion().subscribe({
      next: (datos) => {
        this.articulos = datos.filter(item => item.estado);
        this.articulosFiltrados = [...this.articulos];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar la información', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  filtrarPorCategoria(categoriaId: string): void {
    this.categoriaActiva = categoriaId;
    if (categoriaId === 'TODAS') {
      this.articulosFiltrados = [...this.articulos];
    } else {
      this.articulosFiltrados = this.articulos.filter(item => item.categoria === categoriaId);
    }
    this.cdr.detectChanges();
  }

  obtenerUrlImagen(rutaImagen: string): string {
    if (!rutaImagen) return '';
    if (rutaImagen.startsWith('http')) return rutaImagen;
    return rutaImagen.startsWith('/') ? this.backendUrl + rutaImagen : `${this.backendUrl}/${rutaImagen}`;
  }

  obtenerNombreCategoria(id: string): string {
    const cat = this.categorias.find(c => c.id === id);
    return cat ? cat.nombre : 'General';
  }

  // 3. Nuevo método de navegación
  verDetalle(idArticulo: number): void {
    this.router.navigate(['/portal/informacion', idArticulo]);
  }
}