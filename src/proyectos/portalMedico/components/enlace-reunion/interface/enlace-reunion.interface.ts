import { EnlaceReunion } from '@core/services/portal-medico/interface/pm-cita.interface';

/** Lo que emite el formulario del link en cada cambio (modo sin botones). */
export interface CambioEnlaceReunion {
  valor: EnlaceReunion;
  /** False si hay un dato a medias o un link que no corresponde a la plataforma. */
  valido: boolean;
}
