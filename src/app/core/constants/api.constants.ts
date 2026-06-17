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
  }
};