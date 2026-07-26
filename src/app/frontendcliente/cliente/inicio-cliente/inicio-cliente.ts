import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InicioCarruselComponent } from './inicio-carrusel/inicio-carrusel';
import { TextosService } from '../../../core/services/textos/textos';
import { AdministracionService, InfoGeneralItem } from '../../../core/services/administracion/administracion';

@Component({
  selector: 'app-inicio-cliente',
  standalone: true,
  imports: [CommonModule, RouterModule, InicioCarruselComponent],
  templateUrl: './inicio-cliente.html',
  styleUrls: ['./inicio-cliente.scss']
})
export class InicioClienteComponent implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  textosDinamicos: InfoGeneralItem[] = [];
  cargando = true;

  // Mapa de íconos para asociarlos a las claves que crees en el panel de admin
  private iconosMapa: Record<string, string> = {
    'inicio_informacion': 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477-4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    'inicio_cuidados': 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    'inicio_noticias': 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15'
  };
  
  // Ícono genérico por si creas una clave nueva desde el admin y no está en el mapa
  iconoPorDefecto = 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';

  constructor(
    private adminService: AdministracionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarTextosDinamicos();
  }

  cargarTextosDinamicos(): void {
    this.cargando = true;
    // Solicitamos solo los textos que pertenecen a la sección "inicio"
    this.adminService.getInfoGeneralPublico('inicio').subscribe({
      next: (datos) => {
        this.textosDinamicos = datos;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar textos dinámicos', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  obtenerIcono(clave: string): string {
    return this.iconosMapa[clave] || this.iconoPorDefecto;
  }

  esEnlaceExterno(url: string | undefined): boolean {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://');
  }
}