import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NoticiasService } from '@core/services/noticias/noticias';

// IMPORT DE TEXTOS
import { TextosService } from '@core/services/textos/textos';

type EstadoBaja = 'confirmar' | 'procesando' | 'listo' | 'invalido' | 'error';

/**
 * Página de baja del newsletter. Es el destino del enlace "darse de baja" que
 * va en cada correo del newsletter (?token=..., ver FonoAppNoticias/correos.py
 * en el backend).
 *
 * La baja no se hace al abrir la página sino al presionar "Confirmar baja":
 * algunos filtros antispam abren los enlaces de los correos por su cuenta, y
 * con una baja automática darían de baja al suscriptor sin que él lo pidiera.
 */
@Component({
  selector: 'app-newsletter-baja',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './newsletter-baja.html',
  styleUrls: ['./newsletter-baja.scss']
})
export class NewsletterBajaComponent implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  estado: EstadoBaja = 'confirmar';
  private token = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private noticiasService: NoticiasService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) {
      this.estado = 'invalido';
    }
  }

  confirmarBaja(): void {
    this.estado = 'procesando';
    this.noticiasService.darDeBajaNewsletter(this.token).subscribe({
      next: () => {
        this.estado = 'listo';
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al dar de baja la suscripción', err);
        // 400: token ausente, inválido o alterado; cualquier otro, problema del servidor o de conexión
        this.estado = err?.status === 400 ? 'invalido' : 'error';
        this.cdr.detectChanges();
      }
    });
  }

  irANoticias(): void {
    this.router.navigate(['/portal/noticias']);
  }
}
