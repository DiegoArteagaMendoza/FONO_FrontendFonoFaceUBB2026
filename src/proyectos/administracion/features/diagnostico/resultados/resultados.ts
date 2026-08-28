import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DiagnosticoService } from '@core/services/diagnostico/diagnostico';
import { DiagnosticoFormulario, DiagnosticoRespuestaListado } from '@core/services/diagnostico/interface/diagnostico.interface';
import { TextosService } from '@core/services/textos/textos';

@Component({
  selector: 'app-resultados-diagnostico',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resultados.html'
})
export class ResultadosDiagnostico implements OnInit {
  public textosService = inject(TextosService);
  public t = this.textosService.t;

  idFormulario: number = 0;
  formulario: DiagnosticoFormulario | null = null;
  respuestas: DiagnosticoRespuestaListado[] = [];
  cargando = true;

  constructor(
    private diagnosticoService: DiagnosticoService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.idFormulario = Number(this.route.snapshot.paramMap.get('id'));
    if (this.idFormulario) {
      this.cargarDatos();
    } else {
      this.volver();
    }
  }

  cargarDatos(): void {
    this.cargando = true;

    this.diagnosticoService.obtenerFormulario(this.idFormulario).subscribe({
      next: (formulario) => {
        this.formulario = formulario;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar el formulario', err)
    });

    this.diagnosticoService.listarRespuestas(this.idFormulario).subscribe({
      next: (datos) => {
        this.respuestas = datos;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar los resultados', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  volver(): void {
    this.router.navigate(['administracion/diagnostico']);
  }
}
