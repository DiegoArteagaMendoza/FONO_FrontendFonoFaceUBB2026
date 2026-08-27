import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TextosService } from '@core/services/textos/textos';
import { PortalMedicoService } from '@core/services/portal-medico/portal-medico';
import { PmClienteService } from '@core/services/portal-medico/pm-cliente';
import { BotonTemaComponent } from '@core/components/boton-tema/boton-tema';

@Component({
  selector: 'app-pm-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, BotonTemaComponent],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class PortalMedicoNavbar {
  public textosService = inject(TextosService);
  public t = this.textosService.t;
  public portalMedicoService = inject(PortalMedicoService);
  public pmClienteService = inject(PmClienteService);

  private router = inject(Router);
  private elemento = inject(ElementRef);

  isMenuOpen = false;

  /**
   * Menú "Mi perfil" del profesional. Agrupa perfil, documentos, especialidades
   * y acreditación, que antes iban sueltos en la barra: con la agenda y las
   * horas publicadas eran ocho enlaces seguidos y se apretaban entre sí.
   */
  menuPerfilAbierto = false;

  constructor() {
    // Al navegar, el desplegable debe cerrarse: si no, queda abierto encima de
    // la pantalla nueva.
    this.router.events
      .pipe(filter(evento => evento instanceof NavigationEnd))
      .subscribe(() => {
        this.menuPerfilAbierto = false;
        this.isMenuOpen = false;
      });
  }

  /** Un clic fuera del menú lo cierra, que es lo que espera cualquiera. */
  @HostListener('document:click', ['$event'])
  alHacerClicFuera(evento: MouseEvent): void {
    if (!this.menuPerfilAbierto) return;
    if (!this.elemento.nativeElement.contains(evento.target)) {
      this.menuPerfilAbierto = false;
    }
  }

  /** Escape también lo cierra, por teclado. */
  @HostListener('document:keydown.escape')
  alPulsarEscape(): void {
    this.menuPerfilAbierto = false;
  }

  alternarMenuPerfil(evento: MouseEvent): void {
    // Sin esto, el mismo clic que abre el menú llega al listener del documento
    // y lo cierra en el acto.
    evento.stopPropagation();
    this.menuPerfilAbierto = !this.menuPerfilAbierto;
  }

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

  /** Cierra la sesión del paciente, que es una identidad aparte de la del profesional */
  cerrarSesionPaciente(): void {
    this.pmClienteService.logoutCliente();
    this.closeMenu();
    this.router.navigate(['/portalmedico/inicio']);
  }
}
