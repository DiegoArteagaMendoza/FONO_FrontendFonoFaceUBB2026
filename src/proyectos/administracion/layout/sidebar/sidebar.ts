import { Component, input, output, inject, computed, OnInit } from "@angular/core";
import { RouterModule, Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { AuthService } from "@core/services/auth/auth";
import { AdministracionService } from "@core/services/administracion/administracion";
import { TextosService } from "@core/services/textos/textos";
import { BotonTemaComponent } from "@core/components/boton-tema/boton-tema";

export interface MenuItem {
  path?: string;
  label: string;
  icon: string;
  children?: MenuItem[];
  // Modelo de 3 roles del sistema (ver AdministracionService.UsuarioItem):
  // - Usuario:    ninguno de los dos flags (no ve nada marcado con alguno).
  // - Admin:      is_staff=true. Ve lo marcado con requiresAdmin.
  // - SuperAdmin: is_staff=true + is_superuser=true. Ve TODO, incluido lo
  //               marcado con requiresSuperAdmin (ej. Gestión de Usuarios).
  requiresAdmin?: boolean;
  requiresSuperAdmin?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule, BotonTemaComponent],
  templateUrl: './sidebar.html',
})
export class Sidebar implements OnInit {
  isOpen = input<boolean>(false);
  closeSidebar = output<void>();

  private authService = inject(AuthService);
  private router = inject(Router);
  private adminService = inject(AdministracionService);

  public textosService = inject(TextosService);
  public t = this.textosService.t;

  ngOnInit() {
    if (localStorage.getItem('access_token')) {
      this.adminService.cargarPerfil();
    }
  }

  expandedMenus: Record<string, boolean> = {};

  menuItems: MenuItem[] = [
    { path: 'administracion/inicio', label: 'Inicio', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path: 'administracion/informacion', label: 'Información', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { path: 'administracion/cuidados', label: 'Cuidados', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
    { path: 'administracion/voz', label: 'La Voz', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' },
    { path: 'administracion/noticias', label: 'Noticias', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15' },
    {
      label: 'Administración',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      // Este grupo no requiere ningún rol especial: solo algunos de sus hijos.
      children: [
        { path: '/administracion/carrusel/inicio', label: 'Carrusel de Inicio', icon: '' },
        // Gestión de Usuarios es exclusiva de SuperAdmin (crea/edita cuentas y asigna roles).
        { path: '/administracion/usuario', label: 'Gestion de Usuarios', icon: '', requiresSuperAdmin: true },
        { path: '/administracion/informacion/inicio', label: 'Gestión de Información de Inicio', icon: '' }
      ]
    },
    {
      label: 'Portal Médico',
      icon: 'M12 4.5v15m7.5-7.5h-15',
      // Admin y SuperAdmin comparten los mismos permisos aquí (aprobar/rechazar
      // acreditaciones, validar documentos, gestionar especialidades); por eso
      // basta con requiresAdmin. Solo Usuario queda afuera.
      children: [
        { path: '/administracion/portal-medico/profesionales', label: 'Profesionales', icon: '', requiresAdmin: true },
        { path: '/administracion/portal-medico/especialidades', label: 'Catálogo de Especialidades', icon: '', requiresAdmin: true }
      ]
    },
  ];

  // Filtra los ítems (y sus submenús) según el rol de la sesión actual, y
  // esconde cualquier grupo padre que se quede sin hijos visibles.
  menuFiltrado = computed(() => {
    const usuario = this.adminService.usuarioActual();
    const esAdmin = !!usuario?.is_staff;
    const esSuperAdmin = !!usuario?.is_superuser;

    const esVisible = (item: MenuItem): boolean => {
      if (item.requiresSuperAdmin) return esSuperAdmin;
      if (item.requiresAdmin) return esAdmin;
      return true;
    };

    return this.menuItems
      .filter(esVisible)
      .map(item => {
        if (!item.children) return item;
        return { ...item, children: item.children.filter(esVisible) };
      })
      // Un grupo con hijos declarados pero ninguno visible no debe mostrarse
      // (evita un desplegable vacío, ej. "Portal Médico" para el rol Usuario).
      .filter(item => !item.children || item.children.length > 0);
  });

  toggleMenu(label: string) {
    this.expandedMenus[label] = !this.expandedMenus[label];
  }

  onClose() {
    this.closeSidebar.emit();
  }

  cerrarSesion() {
    this.authService.logout();
    this.onClose();
    this.router.navigate(['/login'], { replaceUrl: true }).then(() => {
      window.location.reload();
    });
  }
}