// Separado del .ts base del componente segun Specs.md: los componentes
// no llevan interfaces, enums ni constantes.

/**
 * Las identidades que conviven en la aplicación.
 * 'portalMedico' cubre la pantalla de login unificada, que sirve tanto a
 * pacientes como a profesionales mediante pestañas: basta con que una de las
 * dos sesiones esté activa para que no tenga sentido volver a ese formulario.
 */
export type IdentidadPortal = 'admin' | 'profesional' | 'paciente' | 'portalMedico';
