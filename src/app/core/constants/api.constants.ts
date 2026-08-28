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
    eliminar: (idVideo: number) => `/${idVideo}/eliminar/`,

    // Videos adjuntos a una cita concreta (solo el profesional que la atiende)
    listarPorCita: (idCita: number) => `/listar/?cita=${idCita}`
  },

  // Portal Médico — citas telemáticas (app PmCita del backend FonoAppPortalMedico).
  // Todos los endpoints de paciente exigen el token del paciente y toman al dueño
  // de la cita desde ese token: el id_cliente NO viaja en el cuerpo.
  portalMedicoCitas: {
    // Paciente autenticado
    reservar: '/reservar/',
    misCitas: (idCliente: number) => `/cliente/${idCliente}/listar/`,
    misCitasProximas: (idCliente: number) => `/cliente/${idCliente}/listar/?proximas=true`,
    clienteCancelar: (idCita: number) => `/${idCita}/cliente/cancelar/`,
    clientePosponer: (idCita: number) => `/${idCita}/cliente/posponer/`,

    // Profesional autenticado
    agenda: '/profesional/listar/',
    agendaProximas: '/profesional/listar/?proximas=true',
    profesionalCancelar: (idCita: number) => `/${idCita}/profesional/cancelar/`,
    profesionalPosponer: (idCita: number) => `/${idCita}/profesional/posponer/`,
    profesionalMarcarRealizada: (idCita: number) => `/${idCita}/profesional/marcar-realizada/`,

    // Detalle: lo puede pedir el paciente dueño, el profesional que atiende o un admin
    detalle: (idCita: number) => `/${idCita}/`,

    // Listado administrativo con filtros combinables
    listar: '/listar/',

    // Disponibilidad: horas que el profesional publica para ser reservadas.
    // El listado por profesional es público porque se puede reservar sin cuenta.
    disponibilidadPublicar: '/disponibilidad/publicar/',
    disponibilidadMias: '/disponibilidad/mias/',
    disponibilidadMiasTodas: '/disponibilidad/mias/?todas=true',
    disponibilidadRetirar: (idDisponibilidad: number) => `/disponibilidad/${idDisponibilidad}/retirar/`,
    disponibilidadDeProfesional: (idProfesional: number) => `/disponibilidad/profesional/${idProfesional}/`,

    // Seguimiento por código: para quien reservó sin cuenta. El código que
    // recibió por correo hace de credencial, por eso no llevan token.
    seguimiento: (codigo: string) => `/seguimiento/${encodeURIComponent(codigo)}/`,
    seguimientoCancelar: (codigo: string) => `/seguimiento/${encodeURIComponent(codigo)}/cancelar/`,
    seguimientoPosponer: (codigo: string) => `/seguimiento/${encodeURIComponent(codigo)}/posponer/`
  },

  // Autoevaluación / diagnóstico rápido (backend FonoApp, app FonoAppDiagnostico).
  // Listar, detalle y responder son públicos: el cliente del portal responde el
  // test sin cuenta propia. Crear, editar, eliminar y ver respuestas exigen el
  // token de una cuenta de administración (cualquier rol).
  diagnostico: {
    listar: '/diagnostico/formularios/listar/',
    detalle: (idFormulario: number) => `/diagnostico/formularios/${idFormulario}/`,
    crear: '/diagnostico/formularios/crear/',
    editar: (idFormulario: number) => `/diagnostico/formularios/${idFormulario}/editar/`,
    eliminar: (idFormulario: number) => `/diagnostico/formularios/${idFormulario}/eliminar/`,
    responder: '/diagnostico/respuestas/crear/',
    respuestasDeFormulario: (idFormulario: number) => `/diagnostico/respuestas/formulario/${idFormulario}/`
  }
};