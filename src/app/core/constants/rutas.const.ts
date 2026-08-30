/**
 * Rutas internas usadas desde código (router.navigate), centralizadas.
 *
 * Los routerLink de las plantillas siguen escribiéndose literales; esto es
 * para las navegaciones programáticas, donde una ruta mal escrita no se
 * detecta hasta que alguien pulsa el botón y el router lanza
 * NG04002: Cannot match any routes.
 *
 * Ojo con dos rutas del panel que se parecen y NO son lo mismo:
 *   /administracion/inicio          -> el dashboard
 *   /administracion/carrusel/inicio -> el listado del carrusel de portada
 */

/** Listado del carrusel de la portada (no confundir con el dashboard). */
export const RUTA_LISTADO_CARRUSEL = '/administracion/carrusel/inicio';

/** Panel de inicio del administrador. */
export const RUTA_DASHBOARD_ADMIN = '/administracion/inicio';
