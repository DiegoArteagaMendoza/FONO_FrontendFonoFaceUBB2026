import { environment } from '../../../environments/environment';

/**
 * Host del backend sin el sufijo '/api' (environment.apiUrl SÍ lo trae),
 * para armar rutas de medios servidas directo por Django (p. ej. '/media/...').
 */
const MEDIA_BASE_URL = environment.apiUrl.replace(/\/api\/?$/, '');

/**
 * Resuelve la URL de una imagen venga como URL absoluta (Cloudinary,
 * 'https://res.cloudinary.com/...') o como ruta relativa vieja servida por
 * Django ('/media/...' o 'foo.jpg').
 *
 * Antes esta misma lógica estaba duplicada en ~20 componentes, cada uno con
 * su propio campo `backendUrl` hardcodeado a 'http://127.0.0.1:8000' — que
 * en cualquier hosting real (dev.vocare-ubb.cl, producción) es la propia
 * máquina del visitante, no el backend. Con Cloudinary devolviendo siempre
 * URLs absolutas este fallback casi nunca se ejecuta, pero cuando lo hacía
 * (medios locales/legado) apuntaba a un host que no existe fuera de un
 * entorno de desarrollo local. Ver DEPLOY_V2NETWORKS.md.
 */
export function obtenerUrlImagen(ruta: string | null | undefined): string {
  if (!ruta) return '';
  if (ruta.startsWith('http')) return ruta;

  if (!ruta.includes('/media/')) {
    const limpia = ruta.startsWith('/') ? ruta.slice(1) : ruta;
    return `${MEDIA_BASE_URL}/media/${limpia}`;
  }
  return ruta.startsWith('/') ? MEDIA_BASE_URL + ruta : `${MEDIA_BASE_URL}/${ruta}`;
}
