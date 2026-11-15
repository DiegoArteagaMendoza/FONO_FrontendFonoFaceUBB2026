// Separado del .ts base del componente según Specs.md: los componentes no
// llevan interfaces, enums ni constantes.

/**
 * Categorías del módulo Información, con los mismos códigos que guarda el
 * backend y que usan el formulario del admin y los listados del portal
 * (farmacos.ts, informacion.ts y promocion.ts).
 *
 * Ojo: no confundir con los códigos de público de Cuidados (NI, PO, CA, LO, GE).
 * Ambos usan 'PO', pero aquí significa Promoción y allá Profesores.
 *
 * - clave: entrada de textos.ts (portal_informacion_detalle) con el nombre visible.
 * - ruta:  listado al que vuelve el botón "Volver" desde el detalle.
 */
export const CATEGORIAS_INFORMACION = {
  FA: { clave: 'categoria_farmacos', ruta: '/portal/farmacos' },
  PE: { clave: 'categoria_prevencion', ruta: '/portal/prevencion' },
  PO: { clave: 'categoria_promocion', ruta: '/portal/promocion' },
} as const;

/** Destino de "Volver" cuando el artículo no tiene una categoría conocida. */
export const RUTA_INICIO_PORTAL = '/portal/inicio';
