# FonoFace — Frontend (UBB 2026)

Frontend en Angular del proyecto FonoFace de la Universidad del Bío-Bío: una plataforma de información y cuidados de la voz que expone dos experiencias distintas dentro de la misma aplicación Angular:

- **Portal Cliente**: sitio público (`/portal/...`) donde cualquier visitante consulta información, cuidados, noticias, fármacos y promoción de la voz.
- **Panel de Administración**: zona privada (`/administracion/...`, `/login`) donde usuarios autenticados gestionan el contenido que se muestra en el portal público.

Ambas experiencias viven en **un solo proyecto Angular** (no son builds separados), pero su código está físicamente separado en carpetas para que sea fácil ubicar y mantener cada una.

## Requisitos previos

- Node.js 20+ (probado con Node 24)
- [pnpm](https://pnpm.io/) como gestor de paquetes (el repo usa `pnpm-lock.yaml`)
- Acceso a la API backend (Django) de FonoFace, corriendo localmente o desplegada

Instalación de dependencias:

```bash
pnpm install
```

## Levantar el proyecto en desarrollo

```bash
pnpm start
```

Esto ejecuta `ng serve` con la configuración `development`. La app queda disponible en `http://localhost:4200/` y se recarga automáticamente al modificar archivos.

En modo desarrollo, el frontend apunta a `src/environments/environment.development.ts`, cuyo `apiUrl` por defecto es `http://127.0.0.1:8000/api` (el backend Django corriendo localmente). Si el backend está en otra URL o puerto, ajusta ese archivo.

## Variables de entorno / configuración de API

La URL del backend se define en `src/environments/`:

- `environment.development.ts` → usada por `ng serve` y por `ng build --configuration development`.
- `environment.ts` → usada por el build de producción (`ng build` por defecto).

Las rutas concretas de cada endpoint (login, informacion, cuidados, noticias, etc.) están centralizadas en [src/app/core/constants/api.constants.ts](src/app/core/constants/api.constants.ts), para no repetir strings de URLs en los servicios.

## Build de producción

```bash
pnpm build
```

Compila la aplicación y deja los artefactos en `dist/FrontendFonoFaceUBB2026/`. Por defecto usa la configuración `production` (optimizada) y el `environment.ts` de producción.

## Tests

```bash
pnpm test
```

Corre los tests unitarios con [Vitest](https://vitest.dev/) a través de `ng test`.

> Nota: al momento de escribir esto hay ~11 specs generados por `ng generate` que quedaron con el nombre de clase desalineado del componente/servicio real (por ejemplo importan `Auth` cuando la clase se llama distinto). Es un problema preexistente, no relacionado a la estructura de carpetas, pendiente de limpieza.

## Estructura de carpetas

```
src/
├── main.ts                  # bootstrap de Angular
├── index.html
├── styles.scss              # estilos globales, importa commons/estilos y commons/administracion/styles
├── environments/            # environment.ts (prod) y environment.development.ts (dev)
│
├── app/                     # BASE de Angular: shell de la app + código compartido
│   ├── app.ts / app.html / app.scss     # componente raíz (<router-outlet>)
│   ├── app.config.ts                    # providers globales (router, HttpClient + interceptor)
│   ├── app.routes.ts                    # ÚNICO archivo de rutas: define /portal/* y /administracion/*
│   └── core/                            # todo lo que comparten Cliente y Administración
│       ├── services/                    # AuthService, InformacionService, CuidadosService,
│       │                                 NoticiasService, AdministracionService, TemaService,
│       │                                 TextosService — el CRUD contra la API vive aquí,
│       │                                 tanto el portal como el panel los reutilizan
│       ├── interceptors/                # auth.interceptor.ts (agrega el token a cada request)
│       ├── constants/                   # api.constants.ts (endpoints del backend)
│       └── components/boton-tema/       # botón de tema claro/oscuro, usado en ambos layouts
│
├── commons/                 # recursos compartidos que no son código Angular "de app"
│   ├── administracion/
│   │   ├── styles/                      # SCSS reutilizable (tablas, botones, modales, filtros...)
│   │   └── texts/textos.ts              # TEXTOS_SITIO: todos los textos de la UI centralizados
│   │                                     # (incluye textos del panel admin Y del portal cliente)
│   └── estilos/tema.scss                # variables CSS para el tema claro/oscuro (Tailwind dark:*)
│
└── proyectos/                # las DOS apps, separadas entre sí
    │
    ├── administracion/                  # PANEL DE ADMINISTRACIÓN (rutas /administracion/*, /login)
    │   ├── layout/                      # Layout con sidebar lateral, propio del panel admin
    │   │   ├── layout.ts                #   shell con <router-outlet> para las vistas admin
    │   │   ├── sidebar/                 #   menú lateral de navegación
    │   │   └── footer/                  #   pie de página del panel
    │   └── features/                    # una carpeta por sección del panel
    │       ├── auth/login/              #   formulario de login
    │       ├── dashboard/inicio/        #   inicio/resumen del panel
    │       ├── informacion/             #   CRUD de información (fármacos/prevención/promoción)
    │       ├── cuidados/                #   CRUD de cuidados vocales
    │       ├── noticias/                #   CRUD de noticias
    │       └── administracion/          #   gestión de: carrusel de inicio, usuarios, textos
    │           ├── inicio/              #     carrusel del inicio del portal público
    │           ├── usuarios/            #     usuarios del sistema
    │           └── infoGeneral/         #     textos dinámicos del portal público
    │
    └── cliente/                          # PORTAL PÚBLICO (rutas /portal/*)
        ├── layout/                       # shell con navbar superior, propio del portal
        ├── navbar/                       # barra de navegación pública
        ├── footer/                       # pie de página público
        ├── inicio-cliente/               # home del portal (incluye inicio-carrusel/)
        ├── informacion/ + informacion-detalle/   # listado y detalle de "Prevención"
        ├── farmacos/                     # listado de "Efectos Farmacológicos" (reusa InformacionService)
        ├── promocion/                    # listado de "Promoción de la voz" (reusa InformacionService)
        ├── cuidados/ + cuidados-detalle/ # listado y detalle de cuidados vocales
        └── noticias/ + noticias-detalle/ # listado y detalle de noticias
```

### ¿Por qué esta separación?

- **`app/core`** contiene únicamente lo que de verdad usan **ambas** apps: los servicios que hablan con la API, el interceptor de autenticación, las constantes de endpoints y el botón de tema. Si un componente solo lo usa Administración o solo Cliente, no vive aquí.
- **`proyectos/administracion`** y **`proyectos/cliente`** son autocontenidos: dentro de cada uno solo hay imports relativos entre sus propios archivos, o hacia `core`/`commons` mediante los alias `@core/*` y `@commons/*` (ver más abajo). Ninguno de los dos importa código del otro.
- **`commons`** guarda estilos y textos que no son "lógica de Angular" pero que se comparten (los textos en particular mezclan secciones de admin y de portal público en un solo objeto `TEXTOS_SITIO`, agrupadas con comentarios).

### Alias de imports (`@core/*`, `@commons/*`)

Definidos en `tsconfig.json`:

```json
"paths": {
  "@core/*": ["src/app/core/*"],
  "@commons/*": ["src/commons/*"]
}
```

Así, cualquier archivo dentro de `proyectos/administracion` o `proyectos/cliente` importa lo compartido sin preocuparse de cuántos niveles de carpeta hay de por medio, por ejemplo:

```ts
import { AuthService } from '@core/services/auth/auth';
import { TEXTOS_SITIO } from '@commons/administracion/texts/textos';
```

## Rutas de la aplicación

Todas las rutas se definen en un único archivo, [src/app/app.routes.ts](src/app/app.routes.ts):

- `/login` → `proyectos/administracion/features/auth/login`
- `/portal/*` → envuelto en `proyectos/cliente/layout` (navbar superior)
- `/administracion/*` (y `''` por defecto redirige a `/portal/inicio`) → envuelto en `proyectos/administracion/layout` (sidebar lateral)

## Convenciones del proyecto

- **Textos centralizados**: no se escriben strings de UI directamente en los componentes; se agregan a `TEXTOS_SITIO` (`src/commons/administracion/texts/textos.ts`) y se consumen vía `TextosService` (`@core/services/textos/textos`).
- **Tema claro/oscuro**: lo maneja `TemaService` (`@core/services/tema/tema`), que escribe el atributo `data-theme` en `<html>`; las clases `dark:*` de Tailwind y las variables CSS de `src/commons/estilos/tema.scss` reaccionan a ese atributo. El toggle visual es `@core/components/boton-tema`, reutilizado en el sidebar de admin y en el navbar del portal.
- **Estilos de administración**: los SCSS reutilizables para tablas, botones, filtros y modales del panel admin están en `src/commons/administracion/styles/` y se importan globalmente desde `src/styles.scss`.
