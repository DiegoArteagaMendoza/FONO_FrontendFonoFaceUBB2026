# Documentación Vocare UBB — deploy y CI/CD (pendiente de implementar)

Todo lo que hay en esta carpeta es **documentación y plantillas aisladas**: nada de lo que contiene está conectado todavía al proyecto real. `public/` sigue solo con el favicon, y no existe carpeta `.github/workflows/` en la raíz del repo. La idea es que esta carpeta se pueda leer, discutir y ajustar sin que nada se active por accidente, y activarla recién cuando corresponda.

## Contenido

| Archivo | Qué es |
|---|---|
| [ARQUITECTURA.md](./ARQUITECTURA.md) | Stack, capas, enrutamiento, comunicación con el backend. Documenta el estado **actual** del código (esto sí describe cómo es hoy, no algo pendiente). |
| [REGLAS_DE_NEGOCIO.md](./REGLAS_DE_NEGOCIO.md) | Roles, sesiones, validación de RUT, flujo de acreditación, etc. También describe el estado **actual** del código. |
| [DEPLOY_V2NETWORKS.md](./DEPLOY_V2NETWORKS.md) | Guía paso a paso para desplegar el build de producción en el hosting cPanel de V2Networks (Plan Emprendedor). |
| [CI_CD_GITHUB_ACTIONS.md](./CI_CD_GITHUB_ACTIONS.md) | Cómo automatizar ese deploy con GitHub Actions. |
| `plantillas/.htaccess` | Reglas Apache para que el SPA funcione al recargar cualquier ruta, más HTTPS/cache/compresión. |
| `plantillas/github-workflows/ci.yml` | Workflow de test + build en cada push/PR. |
| `plantillas/github-workflows/deploy.yml` | Workflow de build + subida por FTP a V2Networks. |

Solo los dos últimos grupos (`.htaccess` y los `.yml`) son "plantillas" en el sentido de que hay que moverlas de sitio para que hagan algo; `ARQUITECTURA.md` y `REGLAS_DE_NEGOCIO.md` son documentación de referencia del código tal como existe hoy, no de algo por implementar.

## Checklist para implementarlo cuando llegue el momento

1. **Backend del Portal Médico desplegado** y `apiUrlPortalMedico` en `src/environments/environment.ts` actualizado (hoy es un placeholder) — ver [ARQUITECTURA.md §5.1](./ARQUITECTURA.md#51-nota-operativa).
2. **CORS** habilitado en ambos backends Django para el dominio final del frontend.
3. **Contratar/activar el hosting** (V2Networks Plan Emprendedor u otro) y apuntar el dominio.
4. Activar el `.htaccess`:
   ```bash
   cp documentacion/plantillas/.htaccess public/.htaccess
   ```
5. Hacer un primer deploy manual siguiendo [DEPLOY_V2NETWORKS.md](./DEPLOY_V2NETWORKS.md), para confirmar que el sitio funciona end-to-end antes de automatizar nada.
6. Activar los workflows de GitHub Actions:
   ```bash
   mkdir -p .github/workflows
   cp documentacion/plantillas/github-workflows/*.yml .github/workflows/
   ```
7. Crear los 4 secrets del repo (`FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`, `FTP_SERVER_DIR`) — ver [CI_CD_GITHUB_ACTIONS.md §2](./CI_CD_GITHUB_ACTIONS.md#2-secrets-necesarios-en-github).
8. Commit + push de `public/.htaccess` y `.github/workflows/*.yml`. Desde ese push a `master`, el deploy queda automatizado.

Ninguno de estos pasos requiere tocar `documentacion/`: los archivos de aquí se **copian** hacia su ubicación real (`public/`, `.github/workflows/`), no se mueven, así esta carpeta queda como referencia permanente de cómo quedaron configurados.
