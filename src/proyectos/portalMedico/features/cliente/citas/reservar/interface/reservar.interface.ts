// Separado del .ts base del componente segun Specs.md: los componentes
// no llevan interfaces, enums ni constantes.

import { DisponibilidadPublica } from '@core/services/portal-medico/interface/pm-cita.interface';

/** Horas disponibles agrupadas por día, que es como las lee una persona. */
export interface DiaConHoras {
  fecha: string;               // ISO del primer bloque, para el pipe date
  horas: DisponibilidadPublica[];
}
