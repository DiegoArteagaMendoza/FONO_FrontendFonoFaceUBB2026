import { AfterViewInit, Directive, ElementRef, OnDestroy, inject } from '@angular/core';

/**
 * Pone en cada celda de una tabla compartida (table.data-table) el título de
 * su columna como atributo data-label.
 *
 * En espacios angostos la tabla se apila como tarjetas (ver el bloque
 * @container de estilo_tablas.scss) y cada celda muestra ese título delante
 * de su valor. Sin esta directiva habría que repetir el título a mano en cada
 * <td> de cada tabla, y se desalinearía en cuanto alguien agregara una
 * columna.
 *
 * Se engancha sola a cualquier <table class="data-table"> del componente que
 * la importe. Las filas llegan después (vienen de una petición HTTP y las
 * pinta un *ngFor), así que observa la tabla y vuelve a etiquetar cuando
 * cambian sus filas o el texto de los títulos.
 *
 * No etiqueta las celdas de acciones ni de imagen: ahí un título delante
 * ("Acciones", "Imagen") solo ocupa espacio.
 */
@Directive({
  selector: 'table.data-table',
  standalone: true
})
export class TablaResponsivaDirective implements AfterViewInit, OnDestroy {
  private tabla: HTMLTableElement = inject(ElementRef<HTMLTableElement>).nativeElement;
  private observador?: MutationObserver;

  ngAfterViewInit(): void {
    this.etiquetar();
    // Solo cambios de estructura y de texto: los atributos que pone la propia
    // directiva no se observan, así que no se dispara a sí misma.
    this.observador = new MutationObserver(() => this.etiquetar());
    this.observador.observe(this.tabla, { childList: true, subtree: true, characterData: true });
  }

  ngOnDestroy(): void {
    this.observador?.disconnect();
  }

  private etiquetar(): void {
    const titulos = Array.from(this.tabla.querySelectorAll('thead th'))
      .map(th => (th.textContent ?? '').trim());

    this.tabla.querySelectorAll('tbody tr').forEach(fila => {
      Array.from(fila.children).forEach((celda, i) => {
        const sinEtiqueta = celda.matches('.td-actions, .td-image') || !!celda.querySelector('.td-actions');
        const etiqueta = sinEtiqueta ? '' : (titulos[i] ?? '');
        if (celda.getAttribute('data-label') !== etiqueta) {
          celda.setAttribute('data-label', etiqueta);
        }
      });
    });
  }
}
