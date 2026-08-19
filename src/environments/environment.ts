export const environment = {
  production: true,
  // Entorno "develop" en cPanel (V2Networks), ver DOCUMENTACION_DESPLIEGUE.md.
  apiUrl: 'https://dev-api.vocare-ubb.cl/api',

  // Backend del Portal Médico (FonoAppPortalMedico), mismo entorno develop.
  apiUrlPortalMedico: 'https://dev-portal.vocare-ubb.cl/api/pm/medicos',

  // Mismo backend del Portal Médico, apps PmCliente y PmVideo: registro de
  // pacientes que buscan atención telemática y subida de sus videos de síntomas.
  apiUrlPortalMedicoClientes: 'https://dev-portal.vocare-ubb.cl/api/pm/clientes',
  apiUrlPortalMedicoVideos: 'https://dev-portal.vocare-ubb.cl/api/pm/videos',

  // App PmCita: agenda de citas telemáticas entre paciente y fonoaudiólogo.
  apiUrlPortalMedicoCitas: 'https://dev-portal.vocare-ubb.cl/api/pm/citas'
};