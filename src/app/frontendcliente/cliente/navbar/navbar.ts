import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TextosService } from '../../../core/services/textos/textos';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class NavbarComponent {
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  isMenuOpen: boolean = false;

  // Alterna el estado del menú en móviles
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  // Cierra el menú automáticamente al hacer clic en un enlace
  closeMenu(): void {
    this.isMenuOpen = false;
  }
}
