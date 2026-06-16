export const API_ENDPOINTS = {
  auth: {
    login: '/usuarios/login/',
    refresh: '/usuarios/token/refresh/',
    logout: '/usuarios/logout/'
  },
  usuarios: {
    lista: '/usuarios/',
    detalle: (id: number) => `/usuarios/${id}/`
  }
  // Aquí irás agregando los endpoints de tus otros componentes a medida que los crees
};