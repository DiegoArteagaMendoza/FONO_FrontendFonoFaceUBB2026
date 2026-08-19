# Reglas de negocio — FonoFace Frontend

> Ver también: [Arquitectura](./ARQUITECTURA.md) · [Deploy en V2Networks](./DEPLOY_V2NETWORKS.md) · [CI/CD con GitHub Actions](./CI_CD_GITHUB_ACTIONS.md)

Este documento recoge las reglas de negocio que hoy están **implementadas en el código** (no aspiracionales), con la referencia al archivo donde viven, para que sirvan de fuente de verdad frente a cambios futuros.

## Identidades y sesiones

El sistema maneja **tres identidades independientes**, cada una con su propio almacenamiento en `localStorage` y su propio flujo de login. Pueden convivir simultáneamente en el mismo navegador (distintas pestañas o incluso la misma sesión de browser):

| Identidad | Claves en `localStorage` | Servicio | Backend |
|---|---|---|---|
| Administrador FonoApp | `access_token`, `refresh_token`, `user_data` | `AuthService` / `AdministracionService` | FonoApp |
| Profesional Portal Médico | `pm_access_token`, `pm_refresh_token`, `pm_profesional_data` | `PortalMedicoService` | FonoAppPortalMedico |
| Visitante del portal público | — (sin sesión) | — | FonoApp (solo lectura) |

Al hacer `logout()` de una identidad, **la otra se preserva explícitamente** (`AuthService.logout()` guarda y restaura `pm_*` antes de hacer `localStorage.clear()`), igual que la preferencia de tema (`tema`). Esto es intencional: cerrar sesión como administrador no debe expulsar a un profesional logueado en otra pestaña del mismo navegador.

*(`src/app/core/services/auth/auth.ts`, `src/app/core/services/portal-medico/portal-medico.ts`)*

## 401 vs 403

El interceptor HTTP distingue explícitamente estos dos códigos porque significan cosas distintas de negocio:

- **401** (no autorizado) en una petición que llevaba token ⇒ el token es inválido/expiró/el usuario detrás ya no existe o fue desactivado. Se interpreta como *"la sesión murió"*: se limpia y se redirige al login correspondiente con `?expirada=1`.
- **403** (prohibido) ⇒ el token es válido pero el usuario **no tiene permiso para esa acción puntual** (ejemplo canónico: un administrador `is_staff` sin `is_superuser` intentando resolver una acreditación, acción reservada al rol máximo). Esto **no** cierra la sesión: se deja pasar el error para que el propio componente muestre "no tienes permisos" y el usuario siga navegando el resto del panel con normalidad.

*(`src/app/core/interceptors/auth.interceptor.ts`)*

## Roles del panel de administración FonoApp

No existe un campo de "rol" nuevo en la base de datos: el rol se **deriva** de la combinación de dos flags que ya expone el backend, `is_staff` e `is_superuser` (el mismo modelo de permisos de Django admin):

| Rol | `is_staff` | `is_superuser` | Puede gestionar |
|---|---|---|---|
| `usuario` | `false` | `false` | Contenido público: información, cuidados, la voz, noticias, carrusel de inicio, textos dinámicos |
| `admin` | `true` | `false` | Todo lo de `usuario` **+** Portal Médico: revisar/validar documentos, listar profesionales |
| `superadmin` | `true` | `true` | Todo lo anterior **+** Gestión de Usuarios (crear/editar/activar cuentas y asignar roles) **+** resolver acreditaciones **+** CRUD del catálogo de especialidades |

La traducción rol → flags (y su inversa) está centralizada en `AdministracionService.mapearRolAPermisos()` / `obtenerRolDeUsuario()`, para que el formulario de creación/edición de usuarios trabaje con la etiqueta de rol y no con los dos booleanos sueltos.

*(`src/app/core/services/administracion/administracion.ts`)*

## Validación de RUT chileno

Todo formulario que pide un RUT (registro de profesional en el Portal Médico; usuarios del panel admin) valida, además del **formato** (`Validators.pattern`, 7-8 dígitos + guion opcional + dígito verificador), el **dígito verificador real** con el algoritmo módulo 11 — el mismo algoritmo que usa el backend (`Security.validators.validar_rut_chileno`). Sin esta validación adicional, un RUT con forma correcta pero checksum inválido (p. ej. `12345678-9`) pasaría el formulario y solo sería rechazado por el backend con un 400 poco claro para el usuario final.

*(`src/app/core/validators/rut.validator.ts`)*

## Contenido público: un solo modelo, tres vistas

"Fármacos", "Prevención" y "Promoción de la voz" en el portal público **no son tres modelos de datos distintos**: son la misma entidad `Informacion` filtrada por el campo `categoria`:

| Sección pública | Código `categoria` |
|---|---|
| Fármacos (`/portal/farmacos`) | `FA` |
| Prevención (`/portal/prevencion`) | `PE` |
| Promoción de la voz (`/portal/promocion`) | `PO` |

Las tres listas filtran client-side sobre la misma respuesta de `InformacionService.getInformacion()` (`item.estado && item.categoria === 'FA' | 'PE' | 'PO'`), y comparten el mismo componente de detalle (`informacion-detalle`), enrutado directamente desde `app.routes.ts` para las tres rutas `farmacos/:id`, `prevencion/:id` y `promocion/:id`. En el panel de administración, en cambio, existe una única sección "Información" que gestiona las tres categorías a la vez.

Análogamente:
- **Cuidados** se segmenta por el campo `publico` (público objetivo del cuidado vocal) vía `CuidadosService.getCuidadosPorPublico(tipoPublico)`.
- **La Voz** se segmenta por el campo `categoria` vía `VozService.getVozPorCategoria(tipoCategoria)`.

Solo se muestra contenido con `estado: true` (borrado lógico / publicación activa) en el portal público; el panel admin gestiona ambos estados.

*(`src/app/core/services/informacion/informacion.ts`, `.../cuidados/cuidados.ts`, `.../voz/voz.ts`, `src/proyectos/cliente/{farmacos,promocion,informacion}/*.ts`)*

## Flujo de acreditación de profesionales (Portal Médico)

El Portal Médico permite a fonoaudiólogos auto-registrarse y luego someterse a un proceso de acreditación que valida un administrador de FonoApp. Es una máquina de estados de 4 valores (`EstadoVerificacion`):

```
PENDIENTE → EN_REVISION → APROBADO
                        ↘ RECHAZADO
```

Reglas asociadas:

1. **Registro propio**: el profesional se registra (`POST /registrar/`) con datos personales + RUT (validado con el algoritmo de arriba) + email + teléfono chileno (`Validators.pattern(/^(\+?56)?[2-9][0-9]{7,8}$/)`) + contraseña (mínimo 8 caracteres). El registro **no requiere** `numero_registro_salud_profesional` (opcional en el formulario).
2. **Documentos de respaldo**: el profesional sube documentos tipificados — `CEDULA_IDENTIDAD`, `CERTIFICADO_TITULO`, `CERTIFICADO_SUPERINTENDENCIA` — cada uno con su propio flag `documento_profesional_valido`, validado individualmente por un administrador (`PATCH .../documentos/:id/validar/`).
3. **Resolución de la acreditación** (`PATCH .../acreditaciones/:id/resolver/`, a `APROBADO` o `RECHAZADO`) está reservada al **administrador de rol máximo** (`superadmin`, es decir `is_superuser`). Un `admin` (`is_staff` sin `is_superuser`) puede listar profesionales y validar documentos individuales, pero recibe 403 si intenta resolver la acreditación completa — consistente con la nota de `EsAdministradorMaximo` en el interceptor.
4. El panel de revisión (`administracion/portal-medico/*`) usa el **token del administrador de FonoApp** (`access_token`), no un token propio del Portal Médico: el backend `FonoAppPortalMedico` valida ese mismo JWT para todas las acciones administrativas.

*(`src/app/core/services/portal-medico/portal-medico.ts`, `src/proyectos/portalMedico/features/{auth/registro,admin,acreditacion}/*`)*

## Especialidades: catálogo vs. autogestión

Dos capas distintas sobre la misma entidad `Especialidad`:

- **Catálogo global**: crear/editar/eliminar especialidades es una acción exclusiva del `superadmin` (mismo criterio de "rol máximo" que la resolución de acreditaciones).
- **Asignación propia (N:M)**: cada profesional autogestiona qué especialidades tiene (`asignarEspecialidad` / `quitarEspecialidad`), sin intervención de un administrador.
- Cada especialidad tiene el flag `especialidad_requiere_certificado`: una especialidad marcada así implica (a nivel de proceso, validado por el backend) que el profesional debe respaldarla con un `CERTIFICADO_SUPERINTENDENCIA` u otro documento pertinente antes de que la acreditación pueda aprobarse.

*(`src/app/core/services/portal-medico/portal-medico.ts`)*

## Sesión y tema

- El **tema** (claro/oscuro) no es un dato de sesión: se conserva a través de cualquier `logout()`, y se aplica **antes** de que Angular arranque (script inline en `index.html`) para evitar parpadeo blanco/negro al recargar. Se persiste bajo la clave `tema` con dos valores válidos: `'claro'` | `'oscuro'`. Sin preferencia guardada, se respeta `prefers-color-scheme` del sistema operativo.

*(`src/app/core/services/tema/tema.ts`, `src/index.html`)*

## Textos centralizados

Ningún string de UI se escribe directamente en un componente: todo vive en el objeto `TEXTOS_SITIO` (`src/commons/administracion/texts/textos.ts`, ~890 líneas) agrupado por sección/feature con comentarios, y se consume vía `TextosService.t()` (una señal). Esto aplica tanto a los textos del panel admin como del portal público y del Portal Médico — es una convención de negocio/producto (contenido editorial revisable en un solo lugar), no solo una decisión técnica.

## Captcha en el login de administración

El formulario de login del panel admin (`proyectos/administracion/features/auth/login`) está preparado para exigir **Google reCAPTCHA** (`ng-recaptcha`, `RecaptchaModule` importado en el componente), pero el provider global (`RECAPTCHA_SETTINGS` con el `siteKey`) está **comentado** en `app.config.ts`. Antes de depender de esta protección en producción hay que descomentar ese provider y configurar un `siteKey` real (actualmente hay uno de prueba hardcodeado en el comentario, no usable en producción).

*(`src/app/app.config.ts`)*

## Limitación conocida: ausencia de route guards

No hay `CanActivate`/`CanMatch` guards en `app.routes.ts`: cualquiera puede navegar a una URL de `/administracion/*` o `/portalmedico/perfil` sin sesión y ver el *shell* del componente renderizarse (aunque las llamadas HTTP a la API fallarán con 401/403, protegiendo los datos reales). Es una brecha de experiencia — no de seguridad de datos — que vale la pena cerrar con guards funcionales (`canActivate: [authGuard]`) que redirijan a `/login` o `/portalmedico/login` cuando no exista el token correspondiente, replicando la misma lógica de detección de sesión que ya usa `authInterceptor`.
