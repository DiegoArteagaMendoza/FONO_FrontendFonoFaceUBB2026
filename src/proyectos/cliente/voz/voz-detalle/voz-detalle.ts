import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { VozService, Voz } from '@core/services/voz/voz';
import { TextosService } from '@core/services/textos/textos';
import { obtenerUrlImagen as resolverUrlImagen } from '@core/utils/media-url.util';

@Component({
  selector: 'app-voz-detalle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './voz-detalle.html',
  styleUrls: ['./voz-detalle.scss']
})
export class VozDetalleComponent implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  voz: Voz | null = null;
  cargando = true;
  errorMensaje = '';

  categorias = [
    { id: 'DEFINICION', nombre: 'Definición' },
    { id: 'ANATOMIA', nombre: 'Anatomía' },
    { id: 'FISIOLOGIA', nombre: 'Fisiología' },
    { id: 'TRASTORNOS', nombre: 'Trastornos de la Voz' },
    { id: 'IMPORTANCIA', nombre: 'Importancia del Cuidado' },
    { id: 'CURIOSIDADES', nombre: 'Curiosidades' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vozService: VozService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.cargarVoz(id);
    } else {
      this.volver();
    }
  }

  cargarVoz(id: number): void {
    this.cargando = true;
    this.vozService.getVoz().subscribe({
      next: (datos) => {
        const encontrado = datos.find(item => item.id_voz === id && item.estado);
        if (encontrado) {
          this.voz = encontrado;
        } else {
          this.errorMensaje = 'Este contenido no existe o no está disponible.';
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

  volver(): void {
    this.router.navigate(['/portal/lavoz']);
  }
}
