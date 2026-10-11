import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CuidadosService, Cuidado } from '@core/services/cuidados/cuidados';
import { TextosService } from '@core/services/textos/textos';
import { obtenerUrlImagen as resolverUrlImagen } from '@core/utils/media-url.util';

@Component({
  selector: 'app-cuidados-detalle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cuidados-detalle.html',
  styleUrls: ['./cuidados-detalle.scss']
})
export class CuidadosDetalleComponent implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  cuidado: Cuidado | null = null;
  cargando = true;
  errorMensaje = '';

  categorias = [
    { id: 'NIÑOS', nombre: 'Niños' },
    { id: 'PROFESORES', nombre: 'Profesores' },
    { id: 'CANTANTES_ACTORES', nombre: 'Cantantes y Actores' },
    { id: 'LOCUTORES', nombre: 'Locutores' },
    { id: 'PUBLICO_GENERAL', nombre: 'Público General' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cuidadosService: CuidadosService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.cargarCuidado(id);
    } else {
      this.volver();
    }
  }

  cargarCuidado(id: number): void {
    this.cargando = true;
    this.cuidadosService.getCuidados().subscribe({
      next: (datos) => {
        const encontrado = datos.find(item => item.id_cuidado === id && item.estado);
        if (encontrado) {
          this.cuidado = encontrado;
        } else {
          this.errorMensaje = 'Esta recomendación no existe o no está disponible.';
        }
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar', err);
        this.errorMensaje = 'Error de conexión con el servidor.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  obtenerUrlImagen(ruta: string | null): string {
    return resolverUrlImagen(ruta);
  }

  obtenerNombreCategoria(id: string): string {
    const cat = this.categorias.find(c => c.id === id);
    return cat ? cat.nombre : 'General';
  }

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

  volver(): void {
    this.router.navigate(['/portal/cuidados']);
  }
}