// Constantes del paciente: reglas del video y claves de localStorage.
// Separadas del servicio según Specs.md.

/**
 * Reglas del video, espejo de las constantes del backend
 * (FonoAppPortalMedico/PmVideo/models.py). Se validan aquí para dar feedback
 * inmediato, pero el backend las vuelve a validar: es él quien manda.
 */
export const VIDEO_DURACION_MAXIMA_SEGUNDOS = 30;
export const VIDEO_TAMANO_MAXIMO_MB = 50;
export const VIDEO_EXTENSIONES_PERMITIDAS = ['mp4', 'webm', 'mov'];
export const VIDEO_DIAS_VIGENCIA = 30;

// Claves de localStorage propias del paciente: distintas a las del profesional
// ('pm_*') y a las del administrador de FonoApp ('access_token'), porque son
// tres identidades separadas que pueden convivir en el mismo navegador.
export const CLAVE_PMC_ACCESS = 'pmc_access_token';
export const CLAVE_PMC_REFRESH = 'pmc_refresh_token';
export const CLAVE_PMC_CLIENTE = 'pmc_cliente_data';

// Token del profesional: hace falta para el único endpoint de este archivo que
// no consulta el propio paciente, sino el fonoaudiólogo (el listado de pacientes
// que usa la agenda para poner nombres a las citas).
export const CLAVE_PM_ACCESS = 'pm_access_token';
