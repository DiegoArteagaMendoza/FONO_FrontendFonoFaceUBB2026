# CI/CD con GitHub Actions

> Ver también: [Arquitectura](./ARQUITECTURA.md) · [Reglas de negocio](./REGLAS_DE_NEGOCIO.md) · [Deploy en V2Networks](./DEPLOY_V2NETWORKS.md)

> ⚠️ **Estado: plantillas, aún no activadas.** Los dos workflows descritos aquí viven como archivos de referencia en `documentacion/plantillas/github-workflows/`, **no** en `.github/workflows/`. GitHub Actions solo detecta y ejecuta workflows que están en `.github/workflows/` en la raíz del repo, así que mientras sigan en `documentacion/` no corren ni consumen minutos de Actions. Esto es intencional: mantiene todo lo generado aislado del proyecto real hasta que decidas implementarlo.

Las plantillas cubren dos workflows:

| Workflow | Dispara con | Qué hace |
|---|---|---|
| `ci.yml` | Push o Pull Request a `develop`/`master` | Instala dependencias, corre `pnpm test` y `pnpm build`, como chequeo de que la rama compila y pasa tests. No despliega nada. |
| `deploy.yml` | Push a `master` (o manualmente) | Build de producción + subida por FTP al hosting de V2Networks. |

Se mantienen separados a propósito: `ci.yml` corre en **cualquier** rama/PR sin necesidad de credenciales del hosting (así un PR desde un fork puede correr los checks sin exponer secretos), y `deploy.yml` solo corre contra `master`, que es la rama que representa producción en este repo.

## 0. Cómo activarlas cuando llegue el momento

```bash
mkdir -p .github/workflows
cp documentacion/plantillas/github-workflows/*.yml .github/workflows/
```

Luego crea los secrets del paso 2 de abajo y haz commit + push de `.github/workflows/`. Recién ahí GitHub empieza a ejecutarlos.

## 1. Cómo funciona `deploy.yml`

1. Se dispara en cada `push` a `master` (ajusta el nombre de rama en el workflow si tu flujo de release usa otra).
2. Instala Node.js y `pnpm` con caché de dependencias.
3. Corre `pnpm build`, generando `dist/FrontendVocareUBB/browser/` (incluye el `.htaccess` solo si ya copiaste la plantilla a `public/.htaccess` — ver [DEPLOY_V2NETWORKS.md](./DEPLOY_V2NETWORKS.md)).
4. Sube **el contenido** de esa carpeta por FTP a la ruta configurada en el hosting, usando la acción [`SamKirkland/FTP-Deploy-Action`](https://github.com/SamKirkland/FTP-Deploy-Action). Esta acción hace un diff contra el estado anterior (guarda un log de sync) y solo transfiere lo que cambió, en vez de resubir todo el sitio en cada deploy.

Es exactamente el mismo resultado que subir manualmente por FileZilla (paso 3, Opción B de la guía de deploy) — solo que automatizado en cada push.

## 2. Secrets necesarios en GitHub

En el repo: **Settings → Secrets and variables → Actions → New repository secret**. Crea estos cuatro:

| Secret | Valor | Dónde se obtiene |
|---|---|---|
| `FTP_SERVER` | Host FTP, p. ej. `ftp.tudominio.cl` | cPanel → Cuentas FTP (o el resumen de la cuenta de hosting) |
| `FTP_USERNAME` | Usuario de la cuenta FTP | cPanel → Cuentas FTP |
| `FTP_PASSWORD` | Contraseña de esa cuenta FTP | La que definiste al crear la cuenta FTP |
| `FTP_SERVER_DIR` | Ruta remota destino, p. ej. `/public_html/` | La carpeta del dominio/subdominio en cPanel |

**Recomendación de seguridad**: crea en cPanel una cuenta FTP dedicada al deploy (no uses el usuario raíz del hosting) con acceso restringido únicamente al directorio del sitio (`public_html/` o el subdominio correspondiente). Así, si el secret se filtrara, el radio de daño queda acotado a ese directorio.

No hay secrets de API/backend que configurar aquí: las URLs de las APIs (`apiUrl`, `apiUrlPortalMedico`) están *baked in* en `src/environments/environment.ts` en tiempo de build (ver [ARQUITECTURA.md §6](./ARQUITECTURA.md#6-configuración-de-build)), no se inyectan por variables de entorno en CI. Si quieres builds distintos por ambiente (staging/producción) sin editar el archivo a mano en cada deploy, la vía Angular-idiomática es agregar una configuración adicional (`--configuration staging`) con su propio `environment.staging.ts` y un `fileReplacements` en `angular.json`.

## 3. Flujo de trabajo sugerido

```
feature/xyz → PR contra develop → ci.yml corre tests + build (checks del PR)
develop     → integración continua
master      → cada push dispara deploy.yml → producción en V2Networks
```

Cuando `develop` esté listo para salir a producción: mergea `develop` → `master` (PR o merge directo). Ese push a `master` dispara el deploy automático.

## 4. Deploy manual (sin esperar un push)

`deploy.yml` incluye `workflow_dispatch`, así que también se puede lanzar a mano desde GitHub: pestaña **Actions** → **Deploy a V2Networks** → **Run workflow**. Útil para re-desplegar sin generar un commit vacío (p. ej. si cambiaste un secret y quieres forzar un redeploy).

## 5. Ver logs de un deploy

Pestaña **Actions** del repo → selecciona la ejecución → job `deploy`. El log de `FTP-Deploy-Action` lista cada archivo subido/borrado/omitido, útil para confirmar que el deploy realmente sincronizó lo esperado sin tener que entrar a cPanel a revisar manualmente.
