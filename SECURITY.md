# Política de seguridad de TaxTech

Documento vivo con las normas que rigen secretos, sesiones e integración con el
SAT. La implementación de la Fase 6 se registra en
[`frontend TaxTech/docs/fase-6.md`](frontend%20TaxTech/docs/fase-6.md).

## 1. Secretos y variables `VITE_*`

- **Regla de oro:** toda variable con prefijo `VITE_` es **pública** (Vite la
  incrusta en el bundle del navegador). Nunca debe tener secretos. `VITE_` solo
  para configuración pública (p. ej. `VITE_API_BASE_URL`).
- El frontend **valida** `VITE_API_BASE_URL` antes de usarla
  (`src/config/env.ts`): solo acepta URL `http(s)`; si falta o es inválida se
  avisa en desarrollo y se usa `http://localhost:4000/api`.
- En el backend los secretos van en variables de entorno de servidor
  (`DATABASE_URL`, `PUERTO`, y en el futuro credenciales del SAT), cargadas
  desde `.env` (ignorado por git) o el orquestador de despliegue.
- `*.env` y `*.log` están en `.gitignore`; se publica únicamente el
  `.env.example`.

## 2. Manejo de tokens de sesión

Hoy la app **no tiene autenticación**: no se almacena ningún token en
`localStorage` ni `sessionStorage`. Cuando se introduzca, esta es la política:

- **Prohibido** guardar tokens JWT/sesión en `localStorage` o `sessionStorage`
  (expuestos a cualquier XSS y a scripts de terceros).
- **Preferido:** cookies `HttpOnly; Secure; SameSite=Strict` emitidas por el
  backend; el frontend solo envía cookies de forma automática en cada petición.
- El backend debe rechazar credenciales por URL/query y nunca loguear tokens.
- El frontend nunca recibe la contraseña/e.firma ni el token en respuestas
  JSON (salvo tokens de CSRF cortos, solo lectura desde JS, junto con una
  cookie de doble envío).

## 3. Integración CFDI / e.firma SAT

El endpoint actual `/api/cfdi/sincronizar` es **simulado** (24 comprobantes, sin
credenciales). El flujo real que se implementará **no debe cambiar esta
frontera**:

1. El frontend solo conoce `POST /api/cfdi/sincronizar` y muestra el resultado.
2. El **backend** gestiona toda la credencial: e.firma (`.cer`, `.key`, password
   o `.pfx`) vive en variables de entorno del servidor o en un gestor de
   secretos, nunca en el bundle ni en el navegador.
3. Cada operación contra el SAT (descarga de CFDI) se firma **en el servidor**
   con la e.firma y el mecanismo de autorización oficial del SAT (token por
   Web Services / firma de peticiones), jamás enviando la e.firma al cliente.
4. La descarga se almacena únicamente en el backend; el frontend recibe los
   comprobantes ya normalizados.
5. El flujo de autorización debe quedar documentado
   (ver `docs/fase-6.md`, sección CFDI).

## 4. Sanitización de datos (XSS)

- **Regla:** nunca usar `dangerouslySetInnerHTML`, `eval`, `new Function` ni
  `innerHTML` con datos del usuario o de la API (no hay ninguna aparición en el
  código actual y está cubierto por lint + test de regresión).
- React escapa el texto por defecto; la prueba `Movimientos.xss.test.tsx`
  garantiza que un concepto/categoría con HTML malicioso se renderiza como
  texto y no monta etiquetas.
- En el backend, los esquemas Zod recortan y limitan la longitud de los textos
  (`concepto`, `categoria`) antes de persistir.

## 5. Auditoría de dependencias

- `npm audit --audit-level=high` se ejecuta **en cada PR** (CI, ambos
  proyectos) y debe pasar sin vulnerabilidades altas o críticas.
- Recomendación: revisión mensual y actualización prioritaria de paquetes con
  CVEs.

## 6. Cabeceras HTTP

- El backend usa `helmet()` (X-Content-Type-Options: nosniff, X-Frame-Options,
  Referrer-Policy, ocultación de X-Powered-By, etc.).
- CORS restringido a los orígenes del frontend en desarrollo
  (`http://localhost:5173`, `http://127.0.0.1:5173`).

## Reporte de vulnerabilidades

Abre un issue describiendo el hallazgo sin exponer datos sensibles, o contacta
al equipo del proyecto.