# Deploy en V2Networks (Plan Emprendedor)

> Ver también: [Arquitectura](./ARQUITECTURA.md) · [Reglas de negocio](./REGLAS_DE_NEGOCIO.md) · [CI/CD con GitHub Actions](./CI_CD_GITHUB_ACTIONS.md)

> ⚠️ **Estado: documentación preparatoria, aún no implementada.** Todo lo referido aquí vive de forma aislada en `documentacion/` y no afecta el proyecto real hasta que se active a propósito. En concreto, la plantilla `documentacion/plantillas/.htaccess` **todavía no está copiada a `public/.htaccess`** — sin ese paso, el build no la incluye y nada de lo de abajo sobre el `.htaccess` aplica todavía. Ver el checklist de activación en [documentacion/README.md](./README.md).

## 0. Qué es esta app para efectos del deploy

Vocare UBB Frontend es un **SPA 100% estático** (sin SSR, sin servidor Node en runtime — ver [ARQUITECTURA.md §1](./ARQUITECTURA.md#1-visión-general)). `pnpm build` genera HTML/JS/CSS/assets en `dist/FrontendVocareUBB/browser/`; ese directorio es literalmente todo lo que hay que subir al hosting. El plan Emprendedor de V2Networks ofrece cPanel con soporte para Node.js y Python además de PHP, pero **no lo necesitamos**: basta con su capa de hosting de archivos estáticos (Apache + FTP/File Manager), igual que para un sitio HTML clásico.

Del Plan Emprendedor usamos en concreto:

- **cPanel** como panel de administración del hosting.
- **Cuentas FTP** para subir los archivos (o el **Administrador de archivos** web de cPanel para hacerlo manualmente).
- **SSL gratis (AutoSSL)** para servir por HTTPS.
- **Dominios/subdominios adicionales ilimitados**, ya en uso para separar el entorno de desarrollo (`dev-api.vocare-ubb.cl`, `dev-portal.vocare-ubb.cl`) del dominio principal.

## 1. Antes de desplegar: checklist

1. **Backend(s) desplegados y accesibles por HTTPS.** El frontend usa `src/environments/environment.ts`, que hoy ya **no tiene placeholders** y apunta al entorno *develop* en V2Networks:
   - `apiUrl`: `https://dev-api.vocare-ubb.cl/api`
   - `apiUrlPortalMedico`: `https://dev-portal.vocare-ubb.cl/api/pm/medicos`
   - `apiUrlPortalMedicoClientes` / `apiUrlPortalMedicoVideos` / `apiUrlPortalMedicoCitas`: mismo host `dev-portal.vocare-ubb.cl`, distinto recurso (ver [ARQUITECTURA.md §5.1](./ARQUITECTURA.md#51-nota-operativa)).

   Estas son URLs de un entorno de **desarrollo**, no necesariamente el dominio final de producción (`vocare-ubb.cl` sin el subdominio `dev-`). Si el destino final del deploy es otro dominio/subdominio, o backends distintos, hay que actualizar `environment.ts` **antes** del build — de lo contrario el sitio compila bien pero llama a las APIs equivocadas.
2. **CORS habilitado en ambos backends Django** para el dominio donde vivirá el frontend (hoy `dev-api.vocare-ubb.cl` / `dev-portal.vocare-ubb.cl`; si cambia el dominio de destino, actualizar CORS también). Si el backend solo permite `localhost`, todas las peticiones del sitio en producción fallarán en el navegador aunque el build esté perfecto.
3. **Dominio apuntando a V2Networks** (registros DNS `A`/`CNAME` ya propagados) — en este caso `vocare-ubb.cl` y sus subdominios `dev-*`.
4. Decide si el sitio vivirá en la **raíz** del dominio (`https://vocare-ubb.cl/`) o en una **subcarpeta** (`https://vocare-ubb.cl/vocare-ubb/`). `index.html` trae `<base href="/">` por defecto, pensado para la raíz — ver ajuste en el paso 3 si usas subcarpeta.

## 2. Activar el `.htaccess` y buildear

El `.htaccess` que resuelve el enrutado del SPA en Apache es solo una **plantilla** por ahora: `documentacion/plantillas/.htaccess`. Angular solo copia al build lo que está dentro de `public/` (ver `assets` en `angular.json`), así que antes de buildear para un deploy real hay que copiarlo ahí:

```bash
cp documentacion/plantillas/.htaccess public/.htaccess
```

Luego sí:

```bash
pnpm install
pnpm build
```

Esto usa la configuración `production` por defecto (`outputHashing: all`, minificado) y deja el resultado en:

```
dist/FrontendVocareUBB/browser/
├── index.html
├── main-XXXXXXXX.js
├── styles-XXXXXXXX.css
├── favicon.ico
├── .htaccess          # solo aparece si copiaste la plantilla a public/ antes del build
└── ...
```

Si vas a desplegar bajo una subcarpeta (no en la raíz del dominio), rebuildea con:

```bash
pnpm build -- --base-href /vocare-ubb/
```

y ajusta `RewriteBase` en `public/.htaccess` (tu copia ya activada) antes del build — está comentado ahí mismo, con instrucciones.

## 3. Subida a cPanel

### Opción A — Administrador de archivos (manual, sin cliente FTP)

1. Entra a cPanel → **Administrador de archivos**.
2. Ve a `public_html/` (si el dominio es el principal de la cuenta) o a la carpeta del dominio/subdominio correspondiente si configuraste uno adicional (cPanel las crea bajo `public_html/nombre-subdominio/` o donde la hayas apuntado en **Dominios**).
3. Si es un redeploy, borra el contenido anterior (o sube a una carpeta nueva y luego cambia el *document root* del dominio) para no mezclar archivos de builds distintos — Angular hashea los nombres de sus bundles en cada build, así que dejar bundles viejos sueltos no rompe nada, pero sí ensucia el hosting.
4. Sube **el contenido** de `dist/FrontendVocareUBB/browser/` (no la carpeta contenedora) directo a la raíz elegida. La forma más simple: comprime esa carpeta en un `.zip` localmente, súbela con el botón **Subir**, y usa **Extraer** en el Administrador de archivos.
5. Confirma que `.htaccess` quedó en la raíz junto a `index.html` (el Administrador de archivos a veces oculta archivos que empiezan con punto — activa "Mostrar archivos ocultos" en Configuración, arriba a la derecha).

### Opción B — Cliente FTP (FileZilla u otro)

1. En cPanel → **Cuentas FTP**, crea una cuenta FTP (o usa las credenciales de la cuenta principal) apuntando al directorio del dominio/subdominio de destino.
2. Conéctate con FileZilla (Host: el que indique cPanel, normalmente `ftp.vocare-ubb.cl`; usuario/clave de la cuenta FTP creada; puerto 21, o SFTP por 22 si el plan lo habilita).
3. Sube el **contenido** de `dist/FrontendVocareUBB/browser/` al directorio remoto (`public_html/` o el que corresponda).

Esta es exactamente la opción que se automatiza con GitHub Actions — ver [CI_CD_GITHUB_ACTIONS.md](./CI_CD_GITHUB_ACTIONS.md).

## 4. SSL (HTTPS)

En cPanel → **SSL/TLS Status** (o **AutoSSL**) → selecciona el dominio → **Ejecutar AutoSSL**. Es gratis e incluido en el plan. Una vez emitido el certificado, descomenta el bloque de redirección forzada a HTTPS que ya viene en `public/.htaccess` (está deshabilitado por defecto para no romper el sitio si aún no hay certificado).

## 5. Verificación post-deploy

- Cargar `https://vocare-ubb.cl/` (o el subdominio `dev-*` correspondiente) → debe verse el portal público (`/portal/inicio` por el redirect de `app.routes.ts`).
- Navegar a una ruta con parámetro y **recargar la página** ahí (p. ej. `/portal/lavoz/1`) → si aparece un 404 de Apache en vez de la app, revisa que `.htaccess` esté presente y que `mod_rewrite` esté habilitado (en cPanel compartido normalmente lo está por defecto).
- Abrir la consola del navegador y confirmar que no hay errores de **CORS** ni `Mixed Content` (peticiones `http://` desde una página `https://`) al listar contenido del portal.
- Probar login del panel admin (`/login`) y del Portal Médico (`/portalmedico/login`) contra los backends reales.

## 6. Actualizaciones futuras

Repetir los pasos 2 y 3 en cada release, reemplazando el contenido del directorio remoto por el del nuevo build. Este es exactamente el proceso que automatiza el workflow de GitHub Actions descrito en [CI_CD_GITHUB_ACTIONS.md](./CI_CD_GITHUB_ACTIONS.md): en vez de repetir manualmente estos pasos, un `git push` a la rama de producción sube el build nuevo por FTP automáticamente.
