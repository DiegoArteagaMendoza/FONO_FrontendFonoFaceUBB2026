export const environment = {
  production: true,
  // apiUrl: 'https://api.tudominio.com/api' // Aquí pones la URL real cuando hagas el deploy
  apiUrl: 'https://proyectofonoaudiologiafaceubb2026.onrender.com/api', // Aquí pones la URL real cuando hagas el deploy

  // URL real del backend del Portal Médico (FonoAppPortalMedico) una vez desplegado.
  apiUrlPortalMedico: 'https://TU-DEPLOY-PORTAL-MEDICO.onrender.com/api/pm/medicos',

  // Mismo backend del Portal Médico, apps PmCliente y PmVideo: registro de
  // pacientes que buscan atención telemática y subida de sus videos de síntomas.
  apiUrlPortalMedicoClientes: 'https://TU-DEPLOY-PORTAL-MEDICO.onrender.com/api/pm/clientes',
  apiUrlPortalMedicoVideos: 'https://TU-DEPLOY-PORTAL-MEDICO.onrender.com/api/pm/videos',

  // App PmCita: agenda de citas telemáticas entre paciente y fonoaudiólogo.
  apiUrlPortalMedicoCitas: 'https://TU-DEPLOY-PORTAL-MEDICO.onrender.com/api/pm/citas'
};