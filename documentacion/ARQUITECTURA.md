# Arquitectura — Vocare UBB Frontend

> Ver también: [Reglas de negocio](./REGLAS_DE_NEGOCIO.md) · [Deploy en V2Networks](./DEPLOY_V2NETWORKS.md) · [CI/CD con GitHub Actions](./CI_CD_GITHUB_ACTIONS.md)

## 1. Visión general

Vocare UBB es una **Single Page Application (SPA) de Angular 22**, sin Server-Side Rendering (SSR): `angular.json` solo define un target `browser` (no hay `server.ts` ni configuración de `@angular/ssr`), y el build de producción genera únicamente estáticos en `dist/FrontendVocareUBB/browser/` (HTML + JS + CSS + assets). Esto es clave para el deploy: **no requiere un servidor Node corriendo**, solo un host de archivos estáticos con reglas de reescritura de rutas (ver [DEPLOY_V2NETWORKS.md](./DEPLOY_V2NETWORKS.md)).

Un único proyecto Angular expone **tres experiencias** distintas, separadas por prefijo de ruta y por identidad de sesión:

| Experiencia | Prefijo de ruta | Backend | Autenticación |
|---|---|---|---|
| Portal público | `/portal/*` | FonoApp (Django) | Ninguna (contenido de lectura pública) |
| Panel de administración FonoApp | `/administracion/*`, `/login` | FonoApp (Django) | JWT propio (`access_token` / `refresh_token`) |
| Portal Médico (profesionales) | `/portalmedico/*` | FonoAppPortalMedico (Django, proyecto **distinto**) | JWT propio (`pm_access_token` / `pm_refresh_token`) |

El panel de revisión de acreditaciones del Portal Médico (`administracion/portal-medico/*`) es una cuarta pieza a nivel de código (vive en `proyectos/portalMedico/features/admin/`) pero **reutiliza la sesión del administrador de FonoApp**, no la del profesional — ver [Reglas de negocio](./REGLAS_DE_NEGOCIO.md#identidades-y-sesiones).

## 2. Stack técnico

- **Framework**: Angular 22 (standalone components, sin `NgModule`), señales (`signal`/`computed`/`effect`) para estado reactivo local en servicios (p. ej. `TemaService`, `AdministracionService.usuarioActual`, `PortalMedicoService.profesionalActual`).
- **Bundler/CLI**: `@angular/build` (esbuild) vía Angular CLI 22.
- **Gestor de paquetes**: `pnpm` (ver `pnpm-lock.yaml` / `packageManager` en `package.json`). No usar `npm install` — desalinea el lockfile.
- **Estilos**: SCSS + Tailwind CSS 3 (`tailwind.config.js`), con tema claro/oscuro por atributo `data-theme` en `<html>` (estrategia `darkMode: ['selector', '[data-theme="oscuro"]']`).
- **HTTP**: `HttpClient` con un único interceptor funcional (`authInterceptor`).
- **Formularios**: Reactive Forms (`FormBuilder`, `Validators`) + un validador custom de RUT chileno.
- **Captcha**: `ng-recaptcha` (Google reCAPTCHA) en el login de administración — actualmente con el provider comentado en `app.config.ts` (ver nota en Reglas de negocio).
- **Testing**: Vitest vía `@angular/build:unit-test` (`pnpm test`).
- **Sin gestor de estado global** (no NgRx/Akita): el estado compartido vive en señales dentro de servicios `providedIn: 'root'`.

## 3. Estructura de carpetas y capas

```
src/
├── app/
│   ├── app.routes.ts        # ÚNICO archivo de rutas de toda la app
│   ├── app.config.ts        # providers globales (router, HttpClient + interceptor)
│   └── core/                 # compartido por LAS TRES experiencias
│       ├── services/         # clientes HTTP hacia los dos backends Django
│       ├── interceptors/     # auth.interceptor.ts
│       ├── validators/       # rut.validator.ts
│       ├── constants/        # api.constants.ts (rutas de endpoints)
│       └── components/       # boton-tema (único componente verdaderamente compartido)
├── commons/                  # no-Angular compartido: estilos SCSS y TEXTOS_SITIO
└── proyectos/                 # las tres experiencias, físicamente separadas
    ├── administracion/        # panel admin FonoApp
    ├── cliente/                # portal público
    └── portalMedico/           # portal de profesionales + su panel admin embebido
```

**Regla de dependencia**: `proyectos/*` puede importar de `core/` y `commons/` (vía alias `@core/*` y `@commons/*` definidos en `tsconfig.json`), pero **nunca** un proyecto importa código de otro proyecto (`cliente` no importa de `administracion` ni viceversa). Solo `app.routes.ts` conoce rutas compartidas entre proyectos (p. ej. `informacion-detalle` sirviendo tanto a `/portal/farmacos/:id` como a `/portal/prevencion/:id` y `/portal/promocion/:id`).

Ver el detalle completo de subcarpetas en el [README.md](../README.md#estructura-de-carpetas) principal — no se duplica aquí para evitar que ambos documentos queden desincronizados.

## 4. Enrutamiento

Un solo `Routes[]` en `app.routes.ts`, con tres bloques de nivel superior envueltos cada uno en su propio layout:

- `path: 'portal'` → `ClienteLayout` (navbar superior) → hijos: inicio, lavoz, farmacos, prevencion, promocion, noticias, cuidados (cada uno con variante `:id` de detalle donde aplica).
- `path: 'portalmedico'` → `PortalMedicoLayout` (navbar propio) → hijos: inicio, login, registro, directorio, perfil, documentos, especialidades, acreditacion.
- `path: ''` → `Layout` (sidebar) → hijos bajo `administracion/*`, incluyendo el panel de revisión del Portal Médico.
- `path: 'login'` (fuera de cualquier layout) → login del panel FonoApp.
- `path: ''` con `redirectTo: '/portal/inicio'` como fallback raíz.

**Importante — no hay route guards** (`CanActivate`/`CanMatch`) en el código actual (no existe carpeta `guards/`). La protección de rutas privadas depende de que cada componente compruebe la sesión (o directamente del backend rechazando peticiones sin token válido, vía el interceptor). Alguien que conozca la URL de `/administracion/usuario` puede cargar el *shell* del componente sin sesión; solo las llamadas HTTP a la API fallarán con 401. Esto es una brecha real de UX (no de seguridad de datos, porque el backend sigue exigiendo el JWT) documentada aquí para que quede explícita — ver recomendación en [Reglas de negocio](./REGLAS_DE_NEGOCIO.md#limitación-conocida-ausencia-de-route-guards).

## 5. Comunicación con el backend

Dos APIs Django independientes, cada una con su propia base URL en `src/environments/`:

```ts
// environment.ts (producción)
apiUrl:               'https://proyectofonoaudiologiafaceubb2026.onrender.com/api'
apiUrlPortalMedico:   'https://TU-DEPLOY-PORTAL-MEDICO.onrender.com/api/pm/medicos' // placeholder, ver §5.1
```

Los endpoints concretos de cada API viven centralizados en `src/app/core/constants/api.constants.ts` (objeto `API_ENDPOINTS`), para no repetir strings en los servicios. Cada servicio de `core/services/*` es un cliente HTTP delgado sobre uno de estos dos backends; no hay lógica de negocio relevante en los servicios más allá de construir URLs, adjuntar el header `Authorization: Bearer <token>` correcto y traducir errores del backend a mensajes legibles (`PortalMedicoService.extraerMensajeError`).

### 5.1 Nota operativa

`environment.ts` de producción todavía tiene `apiUrlPortalMedico` apuntando a un placeholder (`TU-DEPLOY-PORTAL-MEDICO.onrender.com`). **Antes de un build de producción real, hay que reemplazar esa URL por el deploy definitivo del backend `FonoAppPortalMedico`**, o el módulo Portal Médico completo (login, registro, directorio, acreditación) quedará roto en producción aunque el resto de la app funcione.

### 5.2 Interceptor de autenticación

`authInterceptor` (único interceptor HTTP registrado) no agrega el token —cada servicio lo hace por su cuenta al construir sus propios headers—, sino que **reacciona a los 401**: si una petición que llevaba `Authorization` recibe 401, determina de cuál de las dos sesiones era el token comparándolo con lo guardado en `localStorage` (`access_token` vs `pm_access_token`), cierra esa sesión específica y redirige a su login correspondiente con `?expirada=1`. Los 403 se dejan pasar intencionalmente (sesión válida, sin permiso para esa acción puntual) — ver [Reglas de negocio](./REGLAS_DE_NEGOCIO.md#401-vs-403).

## 6. Configuración de build

`angular.json` define un único proyecto (`FrontendVocareUBB`) con dos configuraciones:

- **`production`** (default): optimizado, `outputHashing: all` (cache-busting de assets), presupuestos de tamaño (500kB warning / 1MB error para el bundle inicial). Usa `environment.ts`.
- **`development`**: sin optimizar, sourcemaps, usa `environment.development.ts` vía `fileReplacements`.

El build de producción (`pnpm build` ≡ `ng build`) emite a `dist/FrontendVocareUBB/browser/`. Ese es el directorio que se sube al hosting — ver [DEPLOY_V2NETWORKS.md](./DEPLOY_V2NETWORKS.md).

`src/index.html` fija `<base href="/">`: la app está pensada para vivir en la **raíz** de un dominio o subdominio. Si en algún momento se despliega bajo una subcarpeta (p. ej. `midominio.cl/vocare-ubb/`), hay que rebuildear con `--base-href /vocare-ubb/` (ver detalle en la guía de deploy).

## 7. Requisitos de entorno

- Node.js 20.19+ / 22.12+ / 24+ (compatibilidad de Angular 22 con Node; probado localmente con Node 24).
- pnpm (versión fijada por `packageManager` en `package.json`: `pnpm@11.7.0`).
- Acceso a las dos APIs backend (Django) — local o desplegadas — para que el frontend tenga contenido real que mostrar.
