import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TextosService } from '@core/services/textos/textos';
import { BotonTemaComponent } from '@core/components/boton-tema/boton-tema';
import { DiagnosticoService } from '@core/services/diagnostico/diagnostico';
import { DiagnosticoFormulario } from '@core/services/diagnostico/interface/diagnostico.interface';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, BotonTemaComponent],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class NavbarComponent implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;
  private diagnosticoService = inject(DiagnosticoService);

  isMenuOpen: boolean = false;

  // Formularios de autoevaluación publicados, para el desplegable del navbar.
  formulariosAutoevaluacion: DiagnosticoFormulario[] = [];
  cargandoAutoevaluacion = true;

  ngOnInit(): void {
    this.diagnosticoService.listarFormularios().subscribe({
      next: (datos) => {
        this.formulariosAutoevaluacion = datos;
        this.cargandoAutoevaluacion = false;
      },
      error: (err) => {
        console.error('Error al cargar los formularios de autoevaluación', err);
        this.cargandoAutoevaluacion = false;
      }
    });
  }

  // Alterna el estado del menú en móviles
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  // Cierra el menú automáticamente al hacer clic en un enlace
  closeMenu(): void {
    this.isMenuOpen = false;
  }
}
