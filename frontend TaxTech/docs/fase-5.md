# Fase 5 — Testing

- Fecha del plan: 2026-09-17
- Fecha de implementación: 2026-09-17
- Estado: **implementado y verificado**

## 0. Resumen

La Fase 5 convierte a TaxTech en un proyecto **con red de seguridad**: se añaden
unit tests, component tests e integration tests sobre el frontend, un **mock de
API con MSW** que espeja el comportamiento del backend, **medición de cobertura**
y un **pipeline de CI (GitHub Actions)** que corre `lint` + `build` + `test` en
cada PR. Corresponde a la [Fase 5 del PLAN_MEJORA.md](../PLAN_MEJORA.md).

**Criterio de aceptación cumplido:** cobertura global ~81 % (≥60 % en lógica
pura: **100 %** en `tax.ts` y ~92 % en `format.ts`) y smoke tests de las cuatro
vistas (Dashboard, Movimientos, Deducciones, Impuestos).

## 1. Dependencias nuevas (frontend)

| Paquete | Uso |
|---|---|
| `@testing-library/react` + `@testing-library/dom` | renderizado y consultas de componentes |
| `@testing-library/user-event` | interacciones realistas (clicks, tipeo) |
| `@testing-library/jest-dom` | matchers (`toBeInTheDocument`, etc.) |
| `jsdom` | entorno de DOM para los tests de componente |
| `@vitest/coverage-v8` | reporte y thresholds de cobertura |
| `msw` (`msw/node`) | mock de la API para component/integration tests |

## 2. Configuración

### `vitest.config.ts`

- Entorno `jsdom` + `globals` + `setupFiles: ['src/test/setup.ts']`.
- Incluye `src/**/*.test.{ts,tsx}` (antes solo `.test.ts`).
- `env: { TZ: 'UTC' }`: **fechas deterministas** independientemente de la zona
  horaria del runner (los formatos `es-MX` de `format.ts` dependen de la TZ).
- Cobertura `v8` con thresholds globales: **statements/lines 60 %**, funciones
  60 %, branches 50 % (cumplidos con margen).

### `src/test/setup.ts`

- Arranca/detiene el servidor MSW (`beforeAll`/`afterAll`) con
  `onUnhandledRequest: 'error'` (cualquier petición sin handler falla el test).
- `afterEach`: `cleanup()` + `server.resetHandlers()` + `reiniciarDatos()`
  (restaura el estado en memoria a la semilla; sin esto, el **primer test de
  cada archivo** corría con datos vacíos).

### `src/test/server.ts` (MSW — espejo del backend)

Handlers que replican el comportamiento real de la API:

| Endpoint | Comportamiento |
|---|---|
| `GET /api/resumen` | recalcula ingresos/gastos/deducibles/ISR con `estimarImpuesto` (mismo `tax.ts` que el backend) |
| `GET /api/movimientos` | lista los movimientos en memoria |
| `POST /api/movimientos` | crea y devuelve `201` |
| `PATCH /api/movimientos/:id` | actualiza parcialmente; `404` si no existe |
| `DELETE /api/movimientos/:id` | elimina y responde `204`; `404` si no existe |
| `POST /api/impuestos/reservar` | suma a la reserva fiscal; `400` si cantidad ≤ 0 |
| `POST /api/cfdi/sincronizar` | simula 24 comprobantes |

Los datos mutan en memoria durante cada test, de modo que la **invalidación de
TanStack Query** tras una mutación provoca refetches reales y la UI se
recalcula (lo que se aprovecha para probar el recálculo).

### `src/test/testUtils.tsx`

Helper `renderConProveedores(ui, { rutaInicial })` que envuelve la UI en
`QueryClientProvider` (con `retry: false`, `gcTime: Infinity` para tests
deterministas) + `MemoryRouter`.

## 3. Unit tests (Vitest)

| Archivo | Casos |
|---|---|
| `src/utils/tax.test.ts` (heredado de Fase 3) | `calcularISR`, `obtenerTramo`, `topeDeducciones`, `calcularBaseGravable`, `estimarImpuesto` |
| `src/utils/format.test.ts` (nuevo) | `formatearMoneda` (positivos/negativos/nulos/`NaN`), `formatearFecha`, `formatearFechaLarga`, `formatearPorcentaje` |
| `src/api/client.test.ts` (nuevo) | `ErrorApi` (estado/detalle/mensaje) y `mensajeDeError` (Error nativo, ErrorApi, valores desconocidos) |

Cobertura de lógica pura: **`tax.ts` 100 %** y **`format.ts` ~92 %**.

## 4. Component tests (React Testing Library)

| Archivo | Cubre |
|---|---|
| `src/views/Movimientos.test.tsx` | listado (smoke), estado vacío, estado de error + reintento, filtros por búsqueda, **flujo de alta** (formulario modal → POST → fila nueva), validación de campos obligatorios, **edición** (PATCH → fila refrescada), **eliminación** con confirmación (acepta y cancela) |
| `src/views/Dashboard.test.tsx` | smoke del resumen (saldo, métricas), estado vacío de movimientos recientes, estado de error, gráfica mensual |
| `src/views/Deducciones.test.tsx` | smoke del total deducible y contador, **toggle de deducible** que recalcula el total en vivo, estado vacío, estado de error |
| `src/views/Impuestos.test.tsx` | smoke del desglose ISR (ingresos, tope, base, tramo), **reserva de %** que actualiza la reserva fiscal, error, entrada de porcentaje personalizado |
| `src/components/feedback/feedback.test.tsx` | `Aviso` (éxito/error), `EstadoVacio` (con/sin detalle), `EstadoError` (mensaje + botón reintentar) |
| `src/components/movimientos/FormularioMovimiento.test.tsx` | envío con `onGuardar`, bloqueo de `Deducible` al cambiar a Ingreso, validación, estado "Guardando..." |

## 5. Integration tests

`src/App.test.tsx` — renderiza la app completa dentro de `MemoryRouter`:

- **Navegación** entre las cuatro rutas desde el sidebar (Dashboard ⇄ Movimientos
  ⇄ Deducciones ⇄ Impuestos).
- **Recálculo:** al editar un gasto en Movimientos (PATCH simulado), se `navega`
  al Dashboard y el **saldo neto cambia de $4,031 → $2,751**, demostrando que la
  invalidación de `resumen`/`movimientos` refresca la UI. (El caso unitario
  equivalente en Deducciones también verifica el total deducible en vivo.)
- Ruta desconocida redirige a `/` .

## 6. CI — GitHub Actions (`.github/workflows/ci.yml`)

En la raíz del repo, sobre la carpeta de cada proyecto:

**Job `frontend`** (working-directory `frontend TaxTech`):

```yaml
- npm ci
- npm run lint
- npm run build
- npm run test -- --coverage
```

**Job `backend`** (working-directory `backend TaxTech`):

```yaml
- npm ci
- cp .env.example .env          # DATABASE_URL=file:./dev.db
- npx prisma generate
- npx prisma migrate deploy     # crea el esquema SQLite desde migrations/
- npm run build
- npm test
```

- Se dispara en **cada PR** y en push a `main`.
- Node 22 con caché de `npm` (`cache-dependency-path` apunta al lockfile de cada
  proyecto).
- El lado de pruebas frontend corre con `TZ=UTC`, así los tests de fechas son
  estables en el runner de GitHub.

## 7. Cobertura

Medición real (`vitest --coverage`, provider v8):

| Área | Statements | Branches | Functions | Lines |
|---|---|---|---|---|
| **Global (src/)** | 81.1 % | 79.2 % | 79.7 % | 81.4 % |
| `src/utils` (lógica pura) | 95.7 % | 95.3 % | 100 % | 94.7 % |
| `tax.ts` | 100 % | 95.2 % | 100 % | 100 % |
| `format.ts` | 92.3 % | 95.5 % | 100 % | 90.9 % |
| `src/views` | 81.3 % | 84.7 % | 77.4 % | 81.1 % |

Thresholds configurados (global): statements/lines ≥ 60 %, funciones ≥ 60 %,
branches ≥ 50 % → **cumplidos**, por encima del 60–70 % pedido para lógica pura.

## 8. Caso concreto del recálculo (depurado durante la implementación)

Semiilla: ingresos 5,350 (Uber 850 + Diseño 4,500), gastos 1,319 (Gasolina 720 +
Internet 599, ambos deducibles).

- Resumen inicial → saldo neto `$4,031`, `impuestoEstimado` = ISR(5,350 −
  min(1,319, 535)) = ISR(4,815) = `$92.45`.
- Al PATCHear **Gasolina a $2,000** → gastos = 2,599 → saldo neto `$2,751`.
- El test de integración verifica `$2,751` en el Dashboard tras la edición.

**Bug encontrado y corregido:** el servidor MSW arrancaba con datos vacíos;
`reiniciarDatos()` solo se ejecutaba en `afterEach`, por lo que el **primer
test de cada archivo fallaba** (estado vacío). Se añadió `reiniciarDatos()` al
`beforeAll` del `setup.ts`.

Detalles que se ajustaron para pasar la suite:

- `$92.45` aparece dos veces en Impuestos (tarjeta + desglose) → `findAllByText`.
- `Reserva fiscal` aparece dos veces en Dashboard → `getAllByText`.
- El checkbox `Deducible` tiene detectable name compuesto → `getByLabelText(/Deducible/)`.
- jsdom no aplica CSS de Tailwind → ambos sidebars (móvil/escritorio) están en el
  DOM; los tests de navegación se acotan con `getByLabelText('Navegación principal')`.

## 9. Archivos afectados

Nuevos (frontend):
- `src/test/setup.ts` (MSW server lifecycle + redes de seguridad)
- `src/test/server.ts` (handlers MSW espejo del backend)
- `src/test/testUtils.tsx` (render con proveedores)
- `src/utils/format.test.ts`
- `src/api/client.test.ts`
- `src/views/Movimientos.test.tsx`
- `src/views/Dashboard.test.tsx`
- `src/views/Deducciones.test.tsx`
- `src/views/Impuestos.test.tsx`
- `src/App.test.tsx` (integration)
- `src/components/feedback/feedback.test.tsx`
- `src/components/movimientos/FormularioMovimiento.test.tsx`

Modificados (frontend):
- `vitest.config.ts` (jsdom, setup, TZ, include `.tsx`, cobertura)
- `package.json` y `package-lock.json` (deps de testing)
- `eslint.config.js` (ignora `coverage/`)
- `.gitignore` (`coverage`)

Nuevos (raíz del repo):
- `.github/workflows/ci.yml`

## 10. Verificación

| Comprobación | Resultado |
|---|---|
| Frontend `npm test` | **60/60 en verde (10 archivos)** |
| Frontend `npm run test -- --coverage` | threshold cumplidos; global ~81 % |
| Frontend `npm run lint` | Sin errores |
| Frontend `npm run build` | Compila sin errores |
| Backend `npm test` | **19/19 en verde** (regresión) |
| Backend `npm run build` | Compila sin errores (regresión) |

Comandos:

```bash
# frontend
cd "frontend TaxTech"
npm run lint
npm run test
npm run test -- --coverage   # reporte + thresholds
npm run build

# backend (regresión)
cd "backend TaxTech"
npm run build
npm test
```

## 11. Decisiones registradas

| Decisión | Elección | Por qué |
|---|---|---|
| Mock de API | **MSW v2** con handlers espejo del backend | Intercepta `fetch` real; los refetches por invalidación de TanStack Query funcionan de verdad |
| Recálculo en tests | Edición de un movimiento + navegación al Dashboard | Verifica el contrato completo "mutación → invalidación → refetch → UI nueva" |
| TZ en tests | `env.TZ=UTC` en vitest config | Los formatos `es-MX` de fechas son dependientes de la zona horaria; en CI y local salen idénticos |
| CI | Dos jobs por proyecto (frontend y backend) | Cada uno con su lockfile y pasos (backend necesita `prisma generate` + `migrate deploy`) |
| Thresholds de cobertura | Global ≥60 % (statements/lines/funcs) y branches 50 % | Cumple el criterio 60–70 % con holgura real (~81 %) |
| Primer test vacío (bug) | `reiniciarDatos()` también en `beforeAll` | Los datos del mock inician vacíos por construcción |