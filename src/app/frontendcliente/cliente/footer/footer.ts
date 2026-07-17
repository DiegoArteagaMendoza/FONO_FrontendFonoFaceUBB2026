import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TextosService } from '../../../core/services/textos/textos';

@Component({
  selector: 'app-cliente-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss']
})
export class ClienteFooterComponent {
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  anioActual: number = new Date().getFullYear();
}
