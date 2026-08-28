import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DiagnosticoService } from '@core/services/diagnostico/diagnostico';
import { DiagnosticoFormulario } from '@core/services/diagnostico/interface/diagnostico.interface';
import { TextosService } from '@core/services/textos/textos';

@Component({
  selector: 'app-diagnostico',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './diagnostico.html'
})
export class Diagnostico implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  listaFormularios: DiagnosticoFormulario[] = [];
  cargando = true;

  constructor(
    private diagnosticoService: DiagnosticoService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.diagnosticoService.listarFormularios().subscribe({
      next: (datos) => {
        this.listaFormularios = datos;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar los formularios de diagnóstico', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  totalPreguntas(formulario: DiagnosticoFormulario): number {
    return formulario.subescalas.reduce((total, sub) => total + sub.preguntas.length, 0);
  }

  irACrear(): void {
    this.router.navigate(['administracion/diagnostico/crear']);
  }

  editarFormulario(id: number): void {
    this.router.navigate(['administracion/diagnostico/editar', id]);
  }

  verResultados(id: number): void {
    this.router.navigate(['administracion/diagnostico', id, 'resultados']);
  }

  eliminarFormulario(id: number): void {
    const confirmar = confirm(this.t().globales.confirmacion_eliminar);
    if (!confirmar) return;

    this.diagnosticoService.eliminarFormulario(id).subscribe({
      next: () => {
        this.listaFormularios = this.listaFormularios.filter(item => item.id_formulario !== id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al eliminar', err);
        alert(this.t().erorres.error_eliminacion);
      }
    });
  }
}
