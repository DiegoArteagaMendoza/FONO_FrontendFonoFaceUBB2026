export const environment = {
    production: false,
    apiUrl: 'http://127.0.0.1:8000/api',
    // apiUrl: 'https://proyectofonoaudiologiafaceubb2026.onrender.com/api' // Aquí pones la URL real cuando hagas el deploy

    // Backend del Portal Médico (proyecto Django FonoAppPortalMedico, app PmMedico).
    // Es un proyecto Django distinto al de arriba (misma BD, distinto puerto en desarrollo):
    // corre con `python manage.py runserver 8001` mientras FonoApp usa el 8000.
    apiUrlPortalMedico: 'http://127.0.0.1:8001/api/pm/medicos'
};
