import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar/navbar';
import { ClienteFooterComponent } from './footer/footer';

@Component({
  selector: 'app-cliente-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, ClienteFooterComponent],
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss']
})
export class ClienteLayout {}
