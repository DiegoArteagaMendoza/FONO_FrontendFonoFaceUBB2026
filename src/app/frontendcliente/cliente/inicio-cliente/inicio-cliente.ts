import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-inicio-cliente',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './inicio-cliente.html',
  styleUrls: ['./inicio-cliente.scss']
})
export class InicioClienteComponent {
  caracteristicas = [
    {
      titulo: 'Información Fonoaudiologica',
      descripcion: 'Explora nuestra biblioteca de informacion sobre niños, profesores, cantantes y actores, locutores y publico general.',
      icono: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      ruta: '/portal/informacion'
    },
    {
      titulo: 'Cuidados Vocales',
      descripcion: 'Recomendaciones específicas para profesores, cantantes, locutores y público en general.',
      icono: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
      ruta: '/portal/cuidados'
    },
    {
      titulo: 'Últimas Noticias',
      descripcion: 'Mantente al día con las novedades, eventos y actualizaciones de nuestra plataforma.',
      icono: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15',
      ruta: '/portal/noticias'
    }
  ];
}