import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PortalMedicoNavbar } from './navbar/navbar';
import { TextosService } from '@core/services/textos/textos';

@Component({
  selector: 'app-pm-layout',
  standalone: true,
  imports: [RouterModule, PortalMedicoNavbar],
  templateUrl: './layout.html'
})
export class PortalMedicoLayout {
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  anioActual = new Date().getFullYear();
}
