import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';

// Importamos los servicios que ya creamos
import { InformacionService } from '../../../core/services/informacion/informacion';
import { CuidadosService } from '../../../core/services/cuidados/cuidados';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.scss']
})
export class Inicio implements OnInit {
  nombreUsuario: string = 'Administrador';
  fechaActual: Date = new Date();
  cargandoStats = true;

  // Inicializamos los valores en 0
  estadisticas = [
    { 
      titulo: 'Información Publicada', 
      valor: 0, 
      icono: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      colorClass: 'text-blue-600',
      bgClass: 'bg-blue-100'
    },
    { 
      titulo: 'Cuidados Activos', 
      valor: 0, 
      icono: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
      colorClass: 'text-rose-600',
      bgClass: 'bg-rose-100'
    },
    { 
      titulo: 'Noticias Recientes', 
      valor: 0, 
      icono: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15',
      colorClass: 'text-amber-600',
      bgClass: 'bg-amber-100'
    }
  ];

  accesosRapidos = [
    { titulo: 'Nueva Información', ruta: '/informacion/crear', icono: 'M12 4v16m8-8H4' },
    { titulo: 'Nuevo Cuidado', ruta: '/cuidados/crear', icono: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { titulo: 'Publicar Noticia (PROXIMAMENTE)', ruta: '/noticias', icono: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' }
  ];

  constructor(
    private informacionService: InformacionService,
    private cuidadosService: CuidadosService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDatosUsuario();
    this.cargarEstadisticas();
  }

  cargarDatosUsuario(): void {
    const userDataStr = localStorage.getItem('user_data');
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        if (userData.nombre) {
          this.nombreUsuario = userData.nombre;
        }
      } catch (e) {
        console.error('Error al parsear datos de usuario');
      }
    }
  }

  cargarEstadisticas(): void {
    this.cargandoStats = true;

    // forkJoin ejecuta ambas peticiones al mismo tiempo
    forkJoin({
      informacion: this.informacionService.getInformacion(),
      cuidados: this.cuidadosService.getCuidados()
    }).subscribe({
      next: (respuestas) => {
        // Filtramos para contar solo los registros activos (estado = true)
        const totalInfo = respuestas.informacion.filter(item => item.estado).length;
        const totalCuidados = respuestas.cuidados.filter(item => item.estado).length;

        // Actualizamos los valores en nuestras tarjetas
        this.estadisticas[0].valor = totalInfo;
        this.estadisticas[1].valor = totalCuidados;
        // El de noticias se queda en 0 por ahora hasta que implementemos ese módulo
        
        this.cargandoStats = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar estadísticas del dashboard', err);
        this.cargandoStats = false;
        this.cdr.detectChanges();
      }
    });
  }
}