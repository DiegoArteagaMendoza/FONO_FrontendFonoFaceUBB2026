import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { InformacionService, Informacion } from '../../../core/services/informacion/informacion';

@Component({
  selector: 'app-informacion-detalle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './informacion-detalle.html',
  styleUrls: ['./informacion-detalle.scss']
})
export class InformacionDetalleComponent implements OnInit {
  articulo: Informacion | null = null;
  cargando = true;
  errorMensaje = '';
  public backendUrl = 'http://127.0.0.1:8000';

  // 1. Agregamos el arreglo de categorías
  categorias = [
    { id: 'TODAS', nombre: 'Todas las áreas' },
    { id: 'NI', nombre: 'Niños' },
    { id: 'PO', nombre: 'Profesores' },
    { id: 'CA', nombre: 'Cantantes y Actores' },
    { id: 'LO', nombre: 'Locutores' },
    { id: 'GE', nombre: 'Público General' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private informacionService: InformacionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.cargarArticulo(id);
    } else {
      this.volver();
    }
  }

  cargarArticulo(id: number): void {
    this.cargando = true;
    this.informacionService.getInformacion().subscribe({
      next: (datos) => {
        const encontrado = datos.find(item => item.id_informacion === id && item.estado);
        if (encontrado) {
          this.articulo = encontrado;
        } else {
          this.errorMensaje = 'El artículo no existe o ya no está disponible.';
        }
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar', err);
        this.errorMensaje = 'Error de conexión. Inténtalo más tarde.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  obtenerUrlImagen(ruta: string): string {
    if (!ruta) return '';
    if (ruta.startsWith('http')) return ruta;
    return ruta.startsWith('/') ? this.backendUrl + ruta : `${this.backendUrl}/${ruta}`;
  }

  // 2. Agregamos el método para obtener el nombre completo
  obtenerNombreCategoria(id: string): string {
    const cat = this.categorias.find(c => c.id === id);
    return cat ? cat.nombre : 'General';
  }

  volver(): void {
    this.router.navigate(['/portal/informacion']);
  }
}