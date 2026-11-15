export const environment = {
  production: true,
  // Entorno de PRODUCCIÓN en cPanel (V2Networks): frontend en https://vocare-ubb.cl.
  // Es el que usa `ng build` por defecto. Para el entorno develop
  // (dev.vocare-ubb.cl) usar `ng build --configuration develop`.
  apiUrl: 'https://api.vocare-ubb.cl/api',

  // Backend del Portal Médico (FonoAppPortalMedico), mismo entorno de producción.
  apiUrlPortalMedico: 'https://portal.vocare-ubb.cl/api/pm/medicos',

  // Mismo backend del Portal Médico, apps PmCliente y PmVideo: registro de
  // pacientes que buscan atención telemática y subida de sus videos de síntomas.
  apiUrlPortalMedicoClientes: 'https://portal.vocare-ubb.cl/api/pm/clientes',
  apiUrlPortalMedicoVideos: 'https://portal.vocare-ubb.cl/api/pm/videos',

  // App PmCita: agenda de citas telemáticas entre paciente y fonoaudiólogo.
  apiUrlPortalMedicoCitas: 'https://portal.vocare-ubb.cl/api/pm/citas',

  // App PmTerapia: ejercicios del fonoaudiólogo y seguimiento de terapia
  // (planes, videos de progreso, retroalimentación).
  apiUrlPortalMedicoTerapia: 'https://portal.vocare-ubb.cl/api/pm/terapia'
};
