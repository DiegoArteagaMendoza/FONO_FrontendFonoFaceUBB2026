import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TEXTOS_SITIO } from '@commons/administracion/texts/textos';
import { TextosService } from '@core/services/textos/textos';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss']
})
export class Footer {
    textosService = inject(TextosService);

    textos = this.textosService.t;

    anioActual = new Date().getFullYear();
}