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
  }
};