import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Sidebar } from './sidebar/sidebar';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterModule, Sidebar],
  templateUrl: './layout.html',
})
export class Layout {
  // Signal para manejar el estado del menú en móviles
  isSidebarOpen = signal(false);

  toggleSidebar() {
    this.isSidebarOpen.update(val => !val);
  }
}