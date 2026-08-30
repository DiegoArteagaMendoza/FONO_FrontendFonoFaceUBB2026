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
   * Menú de la cuenta. Cuelga del avatar con las iniciales, que es además la
   * señal de "estás dentro y como quién": antes el profesional lo deducía
   * porque aparecían enlaces nuevos y el paciente porque había un botón suelto
   * de salir, y ninguna de las dos contesta esa pregunta de un vistazo.
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

  // ---------------------------------------------------------------------
  // Identidad visible
  // ---------------------------------------------------------------------

  get esProfesional(): boolean {
    return !!this.portalMedicoService.profesionalActual();
  }

  get esPaciente(): boolean {
    // El profesional manda si por alguna razón conviven las dos sesiones en el
    // mismo navegador, igual que en el despachador del inicio.
    return !this.esProfesional && !!this.pmClienteService.clienteActual();
  }

  get haySesion(): boolean {
    return this.esProfesional || this.esPaciente;
  }

  /** Nombre completo de quien tiene la sesión, para el avatar y su menú. */
  get nombreSesion(): string {
    if (this.esProfesional) {
      return this.portalMedicoService.profesionalActual()?.nombres_profesional ?? '';
    }

    const cliente = this.pmClienteService.clienteActual();
    return cliente ? `${cliente.nombres_cliente} ${cliente.apellidos_clientes}` : '';
  }

  /** Qué tipo de cuenta es, porque el nombre por sí solo no lo dice. */
  get etiquetaSesion(): string {
    return this.esProfesional
      ? this.t().pm_navbar.sesion_profesional
      : this.t().pm_navbar.sesion_paciente;
  }

  /**
   * Hasta dos iniciales del nombre. Se toman las dos primeras palabras porque
   * la sesión del profesional solo trae nombres (sin apellidos) y la del
   * paciente trae ambos: así una y otra dan una inicial razonable.
   */
  get iniciales(): string {
    return this.nombreSesion
      .split(' ')
      .filter(parte => parte.length > 0)
      .slice(0, 2)
      .map(parte => parte[0].toUpperCase())
      .join('');
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
