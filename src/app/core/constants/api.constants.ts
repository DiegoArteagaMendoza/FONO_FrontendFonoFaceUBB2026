export const API_ENDPOINTS = {
  auth: {
    login: '/usuarios/login/',
    refresh: '/usuarios/token/refresh/',
    logout: '/usuarios/logout/'
  },
  informacion: {
    listar: '/informacion/listar/',
    crear: '/informacion/crear/',
    editar: (id: number) => `/informacion/${id}/editar/`,
    eliminar: (id: number) => `/informacion/${id}/eliminar/`
  },
  cuidados: {
    listar: '/cuidados/listar/',
    porPublico: (tipoPublico: string) => `/cuidados/publico/${tipoPublico}/`,
    crear: '/cuidados/crear/',
    editar: (id: number) => `/cuidados/${id}/editar/`,
    eliminar: (id: number) => `/cuidados/${id}/eliminar/`
  },
  voz: {
    listar: '/voz/listar/',
    porCategoria: (tipoCategoria: string) => `/voz/categoria/${tipoCategoria}/`,
    crear: '/voz/crear/',
    editar: (id: number) => `/voz/${id}/editar/`,
    eliminar: (id: number) => `/voz/${id}/eliminar/`
  },
  noticias: {
    listar: '/noticias/listar/',
    crear: '/noticias/crear/',
    editar: (id: number) => `/noticias/${id}/editar/`,
    eliminar: (id: number) => `/noticias/${id}/eliminar/`,
    imagenAgregar: (idNoticia: number) => `/noticias/${idNoticia}/imagenes/agregar/`,
    imagenEliminar: (idImagen: number) => `/noticias/imagenes/${idImagen}/eliminar/`,
    newsletterSuscribir: '/noticias/newsletter/suscribir/'
  },
  // Endpoints del backend FonoAppPortalMedico (app PmMedico). Rutas relativas a
  // environment.apiUrlPortalMedico, no a environment.apiUrl (es otro proyecto Django).
  portalMedico: {
    // Profesional: registro, sesión y perfil propio
    registrar: '/registrar/',
    login: '/login/',
    perfil: '/perfil/',
    perfilEditar: '/perfil/editar/',
    perfilPassword: '/perfil/password/',
    perfilEliminar: '/perfil/eliminar/',

    // Profesional: consultas administrativas y directorio público
    listar: '/listar/',
    detalle: (idProfesional: number) => `/${idProfesional}/`,
    directorio: '/directorio/',

    // Documentos de respaldo
    documentoSubir: '/documentos/subir/',
    documentoEliminar: (idDocumento: number) => `/documentos/${idDocumento}/eliminar/`,
    profesionalDocumentosListar: (idProfesional: number) => `/${idProfesional}/documentos/`,
    documentoValidar: (idDocumento: number) => `/documentos/${idDocumento}/validar/`,

    // Acreditación
    acreditacionesPendientes: '/acreditaciones/pendientes/',
    acreditacionEstado: (idProfesional: number) => `/acreditaciones/${idProfesional}/estado/`,
    acreditacionResolver: (idAcreditacion: number) => `/acreditaciones/${idAcreditacion}/resolver/`,

    // Especialidad (catálogo)
    especialidadesListar: '/especialidades/listar/',
    especialidadCrear: '/especialidades/crear/',
    especialidadEditar: (idEspecialidad: number) => `/especialidades/${idEspecialidad}/editar/`,
    especialidadEliminar: (idEspecialidad: number) => `/especialidades/${idEspecialidad}/eliminar/`,

    // Especialidades del profesional (autogestión N:M)
    especialidadAsignar: '/especialidades/asignar/',
    especialidadQuitar: (idEspecialidad: number) => `/especialidades/${idEspecialidad}/quitar/`,
    profesionalEspecialidadesListar: (idProfesional: number) => `/${idProfesional}/especialidades/`
  },

  // Portal Médico — pacientes (app PmCliente del backend FonoAppPortalMedico)
  portalMedicoClientes: {
    // Paciente: registro, sesión y perfil propio
    registrar: '/registrar/',
    login: '/login/',
    perfil: '/perfil/',
    perfilEditar: '/perfil/editar/',
    perfilPassword: '/perfil/password/',

    // Consultas del profesional o del administrador
    listar: '/listar/',
    detalle: (idCliente: number) => `/${idCliente}/`,
    editar: (idCliente: number) => `/${idCliente}/editar/`,
    eliminar: (idCliente: number) => `/${idCliente}/eliminar/`
  },

  // Portal Médico — videos de síntomas (app PmVideo del backend FonoAppPortalMedico)
  portalMedicoVideos: {
    // Paciente autenticado
    subir: '/subir/',
    misVideos: '/mis-videos/',
    miVideoEliminar: (idVideo: number) => `/mis-videos/${idVideo}/eliminar/`,

    // Profesional o administrador
    listar: '/listar/',
    detalle: (idVideo: number) => `/${idVideo}/`,
    eliminar: (idVideo: number) => `/${idVideo}/eliminar/`
  }
};