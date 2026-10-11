import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Sidebar } from './sidebar/sidebar';
import { Footer } from './footer/footer';
import { TextosService } from '@core/services/textos/textos';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterModule, Sidebar, Footer],
  templateUrl: './layout.html',
})
export class Layout {
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  // Signal para manejar el estado del menú en móviles
  isSidebarOpen = signal(false);

  toggleSidebar() {
    this.isSidebarOpen.update(val => !val);
  }
}
