import { Injectable, signal, computed, effect } from '@angular/core';

export type Tema = 'claro' | 'oscuro';

/** Clave con la que se recuerda la preferencia en el navegador */
export const CLAVE_TEMA = 'tema';

@Injectable({
  providedIn: 'root'
})
export class TemaService {
  private readonly _tema = signal<Tema>(this.temaInicial());

  /** Tema activo ('claro' u 'oscuro') */
  public readonly tema = this._tema.asReadonly();

  /** Atajo para plantillas: true cuando el tema oscuro está activo */
  public readonly esOscuro = computed(() => this._tema() === 'oscuro');

  constructor() {
    // Cada vez que cambia el tema lo escribimos en el <html> y lo recordamos.
    // Las variables CSS de commons/estilos/tema.scss y las clases dark:* de
    // Tailwind reaccionan a este atributo.
    effect(() => {
      const tema = this._tema();
      document.documentElement.setAttribute('data-theme', tema);
      try {
        localStorage.setItem(CLAVE_TEMA, tema);
      } catch {
        // Si el navegador bloquea el almacenamiento, el tema igual se aplica
      }
    });
  }

  /** Alterna entre claro y oscuro */
  alternar(): void {
    this._tema.update(actual => (actual === 'oscuro' ? 'claro' : 'oscuro'));
  }

  /** Fija un tema concreto */
  establecer(tema: Tema): void {
    this._tema.set(tema);
  }

  private temaInicial(): Tema {
    const guardado = localStorage.getItem(CLAVE_TEMA);
    if (guardado === 'claro' || guardado === 'oscuro') {
      return guardado;
    }
    // Primera visita: respetamos la preferencia del sistema operativo
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro';
  }
}
