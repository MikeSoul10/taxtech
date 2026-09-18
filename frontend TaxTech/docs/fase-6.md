# Fase 6 — Seguridad y datos sensibles

- Fecha del plan: 2026-09-17
- Fecha de implementación: 2026-09-17
- Estado: **implementado y verificado**
- Política de referencia: [`../../SECURITY.md`](../../SECURITY.md)

## 0. Resumen

La Fase 6 sella el **perímetro de seguridad** del proyecto sin cambiar la
funcionalidad: las variables públicas `VITE_*` se **validan** y se prohíben para
secretos, se documenta la **política de tokens/sesiones** (cookies `HttpOnly`),
se define el **flujo CFDI** con la e.firma confinada al backend, se añade un
**test de regresión XSS**, se fortalecen las cabeceras HTTP con `helmet()` y la
**auditoría de dependencias** entra a la CI. Corresponde a la
[Fase 6 del PLAN_MEJORA.md](../PLAN_MEJORA.md).

**Criterio de aceptación:** revisión de seguridad sin hallazgos críticos
(`npm audit` en ambos proyectos: **0 vulnerabilidades**; sin `eval`/`innerHTML`
ni `dangerouslySetInnerHTML`; secretos no versionados).

## 1. No exponer secretos — variables `VITE_*`

- Única variable pública del frontend: `VITE_API_BASE_URL` (definida en
  `.env.example`, usada por el cliente HTTP).
- **Nuevo `src/config/env.ts`**: valida en tiempo de ejecución que
  `VITE_API_BASE_URL` sea una URL `http(s)` (`new URL` + comprobación de
  esquema). Si falta, está vacía o es inválida (`javascript:alert(1)`,
  `ftp://`, `localhost:4000/api` sin esquema…) emite `console.warn` en
  desarrollo y usa el fallback `http://localhost:4000/api`.
- `src/api/client.ts` consume la URL validada y la re-exporta (`URL_API`)
  sin cambios para el resto de la app.
- **Regla documentada en `SECURITY.md`:** todo lo prefijado con `VITE_` es
  público en el bundle; los secretos viven solo en variables del backend o en
  un gestor de secretos.
- Cobertura de `env.ts`: **92.85 % stmts / 100 % funcs** con
  `src/config/env.test.ts` (7 casos: ausente, vacío, http, https, esquema no
  http(s), sin esquema, constante exportada).

## 2. Manejo seguro de tokens de sesión

- La app **no tiene autenticación hoy**: no se lee ni escribe nada en
  `localStorage`/`sessionStorage` (verificado por búsqueda en el código).
- Política pactada para cuando llegue la sesión (documentada en `SECURITY.md`):
  - **Prohibido** guardar tokens en `localStorage`/`sessionStorage`.
  - Cookies `HttpOnly; Secure; SameSite=Strict` emitidas por el backend.
  - El frontend nunca obtiene la contraseña ni el token desde respuestas JSON;
    el backend no loguea tokens ni acepta credenciales por URL.

## 3. Integración CFDI real — e.firma confinada al backend

- Estado actual: `POST /api/cfdi/sincronizar` es **simulación** (no recibe ni
  usa credenciales).
- **Flujo documentado** (en `SECURITY.md` y abajo) para la implementación real,
  sin cambiar la frontera del frontend:
  1. El frontend solo invoca `POST /api/cfdi/sincronizar` y pinta el resultado.
  2. La **e.firma** (`.cer`/`.key`/password o `.pfx`) se guarda en variables de
     entorno del servidor o gestor de secretos; **nunca** en `VITE_*` ni en el
     navegador.
  3. Cada operación contra el SAT se firma **en el servidor** con el mecanismo
     de autorización oficial (token por Web Services / firma de peticiones).
  4. Los comprobantes se descargan y normalizan en el backend; el frontend solo
     recibe los datos ya procesados.

## 4. Sanitización de datos (XSS)

- **Auditoría manual del código:** cero apariciones de `dangerouslySetInnerHTML`,
  `eval`, `new Function` o `innerHTML`; React ya escapa el texto por defecto.
- **Nuevo test de regresión `src/views/Movimientos.xss.test.tsx`**: se siembra
  un movimiento con `concepto` = `<img src=x onerror=…><script>…</script>` y una
  `categoria` con `<svg onload=…>`, y se verifica que:
  - el texto malicioso aparece **literalmente** (escapado) en la UI;
  - no se monta ningún `img`, `script` ni `svg[onload]` en el DOM;
  - el `document.title` no cambia (la carga maliciosa no se ejecuta).
- En el backend, los esquemas Zod recortan (`trim`) y acotan la longitud de
  `concepto` (120) y `categoria` (80) antes de persistir.

## 5. Auditoría de dependencias (`npm audit`)

- Estado actual: **0 vulnerabilidades** en `frontend TaxTech` y en
  `backend TaxTech` (`npm audit --audit-level=high`).
- **CI actualizada** (`.github/workflows/ci.yml`): nuevo paso
  `npm audit --audit-level=high` en los jobs de frontend y backend, tras
  `npm ci`, de modo que bloquea el PR si hay hallazgos altos/críticos.
- Recomendación registrada en `SECURITY.md`: revisión mensual.

## 6. Cabeceras HTTP del backend

- **Nuevo middleware `helmet`** (`npm install helmet`) aplicado al inicio de
  `crearApp()`: `X-Content-Type-Options: nosniff`, `X-Frame-Options`, políticas
  de referrer/CSP y ocultación de `X-Powered-By`.
- **Nuevo test** en `backend TaxTech/src/app.test.ts`: verifica que
  `/api/estado` responda con `nosniff`, `X-Frame-Options` y sin
  `X-Powered-By`.
- El CORS sigue restringido a `http://localhost:5173` y `http://127.0.0.1:5173`.
- `.gitignore` del backend: se añade `*.log` (los `server.log`/`server.err.log`
  locales ya estaban cubiertos por el gitignore raíz; ahora el backend también
  los ignora si se clona solo).

## 7. Archivos afectados

Frontend (nuevos):
- `src/config/env.ts` (validación de `VITE_API_BASE_URL`)
- `src/config/env.test.ts`
- `src/views/Movimientos.xss.test.tsx`

Frontend (modificados):
- `src/api/client.ts` (usa y re-exporta `URL_API` desde `config/env`)
- `PLAN_MEJORA.md` (Fase 6 marcada como completada)

Backend (modificados):
- `src/app.ts` (helmet + import)
- `src/app.test.ts` (test de cabeceras de seguridad)
- `package.json` / `package-lock.json` (dependencia `helmet`)
- `.gitignore` (`*.log`)

Raíz del repo:
- `.github/workflows/ci.yml` (audit en ambos jobs)
- `SECURITY.md` (política de seguridad de referencia)
- `frontend TaxTech/docs/fase-6.md` (este documento)

## 8. Verificación

| Comprobación | Resultado |
|---|---|
| Frontend `npm test` | **69/69 en verde (12 archivos)** |
| Frontend coverage | Global 81.51 %; `env.ts` 92.85 %; thresholds cumplidos |
| Frontend `npm run lint` + `npm run build` | Sin errores |
| Frontend `npm audit --audit-level=high` | **0 vulnerabilidades** |
| Backend `npm test` | **20/20 en verde** (incluye cabeceras de seguridad) |
| Backend `npm run build` | Sin errores |
| Backend `npm audit --audit-level=high` | **0 vulnerabilidades** |
| XSS | Sin `dangerouslySetInnerHTML`/`innerHTML`/`eval`; test de regresión en verde |

Comandos:

```bash
# frontend
cd "frontend TaxTech"
npm run lint
npm run test
npm audit --audit-level=high

# backend
cd "backend TaxTech"
npm run build
npm test
npm audit --audit-level=high
```

## 9. Decisiones registradas

| Decisión | Elección | Por qué |
|---|---|---|
| Validación de `VITE_*` | Función pura `validarUrlApi` en `src/config/env.ts` (advertencia en dev + fallback) | No bloquea el arranque, es testeable y no rompe el contrato actual |
| Tokens de sesión | Política `HttpOnly; Secure; SameSite=Strict`, prohibido `localStorage` | Estándar OWASP; la app aún no tiene auth, se deja documentado |
| CFDI | La e.firma solo en el backend (variables de entorno / secretos); el frontend solo llama al endpoint | El navegador nunca ve la credencial; la frontera actual se mantiene |
| XSS | Confiar en el escaping de React + test de regresión con payload real | Evitar librerías inseguras; el test protege futuros cambios |
| `npm audit` | Paso bloqueante en CI (`--audit-level=high`) | Hace de la auditoría un hábito antes de cada merge |
| Cabeceras HTTP | `helmet()` con configuración por defecto sobre la API JSON | Escudo de headers sin config manual; ya cubierto por test |