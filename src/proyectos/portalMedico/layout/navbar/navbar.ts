import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TextosService } from '@core/services/textos/textos';
import { PortalMedicoService } from '@core/services/portal-medico/portal-medico';
import { BotonTemaComponent } from '@core/components/boton-tema/boton-tema';

@Component({
  selector: 'app-pm-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, BotonTemaComponent],
  templateUrl: './navbar.html'
})
export class PortalMedicoNavbar {
  public textosService = inject(TextosService);
  public t = this.textosService.t;
  public portalMedicoService = inject(PortalMedicoService);

  private router = inject(Router);

  isMenuOpen = false;

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  cerrarSesion(): void {
    this.portalMedicoService.logoutProfesional();
    this.closeMenu();
    this.router.navigate(['/portalmedico/login']);
  }
}
