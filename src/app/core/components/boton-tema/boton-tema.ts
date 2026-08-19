import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemaService } from '../../services/tema/tema';
import { TextosService } from '../../services/textos/textos';

/**
 * Botón reutilizable para alternar entre tema claro y oscuro.
 * Se usa tanto en el navbar del portal cliente como en el sidebar del panel
 * de administración. Hereda el color del contenedor (currentColor), así que
 * se adapta solo a fondos claros y oscuros.
 */
@Component({
  selector: 'app-boton-tema',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      class="boton-tema"
      (click)="temaService.alternar()"
      [title]="etiqueta"
      [attr.aria-label]="etiqueta">

      <!-- Luna: se muestra en tema claro (al pulsar se activa el oscuro) -->
      <svg *ngIf="!temaService.esOscuro()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
      </svg>

      <!-- Sol: se muestra en tema oscuro (al pulsar se vuelve al claro) -->
      <svg *ngIf="temaService.esOscuro()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
      </svg>
    </button>
  `,
  styles: [`
    .boton-tema {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      padding: 0.4rem;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s ease, transform 0.2s ease;
    }

    .boton-tema:hover {
      background-color: rgba(127, 127, 127, 0.18);
      transform: scale(1.05);
    }

    .boton-tema svg {
      width: 22px;
      height: 22px;
      display: block;
    }
  `]
})
export class BotonTemaComponent {
  public temaService = inject(TemaService);
  private textosService = inject(TextosService);

  get etiqueta(): string {
    const textos = this.textosService.t().globales;
    return this.temaService.esOscuro() ? textos.activar_tema_claro : textos.activar_tema_oscuro;
  }
}
