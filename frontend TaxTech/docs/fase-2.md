# Fase 2 — Backend real de TaxTech y capa de datos del frontend

- Fecha del plan: 2026-09-12
- Fecha de implementación: 2026-09-12
- Estado: **implementado y verificado**

## 0. Resumen

La Fase 2 sustituyó los datos simulados por una **API REST real** en
`taxtech-front/backend TaxTech` (Express 5 + TypeScript + SQLite/Prisma + Zod) y
conectó el frontend a ella con un **cliente `fetch` tipado** (AbortController,
timeout, retry y errores HTTP), añadiendo **estados de carga, error y vacío**
coherentes en las cuatro vistas. Corresponde a la
[Fase 2 del PLAN_MEJORA.md](../PLAN_MEJORA.md), implementada con la
**Opción A** (backend disponible).

## 1. Objetivo

Sustituir los datos simulados del frontend por una API REST real que sirva el
mismo contrato que `taxtechApi.ts` ya exponía, manteniendo a los componentes
intactos (la Fase 1 dejó todo consumiendo hooks).

## 2. Decisiones de arquitectura

| Decisión | Elección | Por qué | Adoptada |
|---|---|---|---|
| Lenguaje | TypeScript (Node 24) | Mismo lenguaje que el frontend; tipos compartibles mentalmente. | Sí |
| Framework | Express 5 | Comunidad enorme, ideal académico, documentación abundante. | Sí |
| Base de datos | SQLite + Prisma | Archivo local sin servidor; migraciones, seed y cliente tipado. Migrable a PostgreSQL luego. | Sí |
| Validación | Zod | Esquemas compartidos y errores tipados. | Sí |
| CORS | `cors` con origen del dev server | Frontend corre en `localhost:5173`. | Sí |
| Estructura | `backend/` dentro del repo | Monorepo simple, un solo `git clone`. | Sí (como `backend TaxTech/`) |
| Tests | Vitest + Supertest | Unit de lógica pura + integration sobre la BD local. | Sí |
| Cliente HTTP | `fetch` + wrapper propio | AbortController, timeout, retry y errores tipados sin deps extra. | Sí |

## 3. Contrato de la API

Base URL: `http://localhost:4000/api`

| Método | Ruta | Descripción | Respuesta |
|---|---|---|---|
| GET | `/estado` | Health check | `{ ok, mensaje }` |
| GET | `/resumen` | Resumen financiero del periodo | `ResumenFinanciero` |
| GET | `/movimientos` | Lista de movimientos (fecha desc) | `Movimiento[]` |
| POST | `/movimientos` | Crear movimiento | `Movimiento` (201) |
| PATCH | `/movimientos/:id` | Editar movimiento (parcial) | `Movimiento` / 404 |
| DELETE | `/movimientos/:id` | Eliminar movimiento | 204 / 404 |
| POST | `/impuestos/reservar` | Reservar impuestos | `ResultadoReserva` (201) |
| POST | `/cfdi/sincronizar` | Simular sincronización CFDI | `ResultadoSincronizacion` |

Tipos (espejo de `src/types/index.ts` del frontend):

```ts
type TipoMovimiento = 'Ingreso' | 'Gasto'

interface Movimiento {
  id: string
  concepto: string
  tipo: TipoMovimiento
  monto: number
  fecha: string   // ISO
  categoria: string
  deducible: boolean
}

interface ResumenFinanciero {
  ingresos: number
  gastos: number
  deducibles: number
  impuestoEstimado: number
  reservaFiscal: number
}

interface ResultadoSincronizacion {
  comprobantesEncontrados: number
  mensaje: string
}

interface ResultadoReserva {
  ok: boolean
  cantidadReservada: number
}
```

## 4. Modelo de datos (Prisma)

```prisma
model Movimiento {
  id        String   @id @default(uuid())
  concepto  String
  tipo      String   // "Ingreso" | "Gasto" (validado con Zod antes de guardar)
  monto     Float
  fecha     DateTime
  categoria String
  deducible Boolean  @default(false)
  createdAt DateTime @default(now())
}

model ReservaFiscal {
  id        String   @id @default(uuid())
  cantidad  Float
  fecha     DateTime @default(now())
}
```

Reglas de negocio:

- El `resumen` **se calcula** en cada request (no se persiste):
  - `ingresos` = SUM(monto) donde `tipo = Ingreso`.
  - `gastos` = SUM(monto) donde `tipo = Gasto`.
  - `deducibles` = SUM(monto) donde `tipo = Gasto` y `deducible = true`.
  - `impuestoEstimado` = `calcularISR(base = ingresos − deducibles)`.
  - `reservaFiscal` = SUM(cantidad) de `ReservaFiscal`.
- `monto` siempre positivo; el signo lo decide `tipo`.
- PATCH acepta campos parciales; cada campo se escribe solo si viene definido
  (`actualizarMovimientoSchema = crearMovimientoSchema.partial()`).

## 5. Servicio fiscal (ISR)

- `src/services/taxService.ts`: tarifa del ISR vigente como tabla por año
  (`TARIFA_ISR_2026`, 11 tramos de la LISR con límite inferior, cuota fija y %
  de excedente; el último tramo con `limiteSuperior: null`), independiente del
  controller y de Prisma.
- `calcularISR(baseGravable: number): number` es lógica pura: base `<= 0`, no
  finita o sin tramo → `0`. Resultado con redondeo a centavos.
- Unit-testeado con casos límite (base 0, negativos, NaN y rangos de la tabla).
- Preparado para evolucionar en la Fase 3 (deducciones personalizadas, cálculo
  por periodos).

## 6. Manejo de errores (backend)

`src/middlewares/errorHandler.ts` centraliza:

- `ZodError` → `400` con `{ ok: false, mensaje: 'Datos inválidos', errores: [{ campo, mensaje }] }`.
- Cualquier otro error → `500` con `{ ok: false, mensaje }`.
- Las rutas de movimiento devuelven `404` con `{ ok: false, mensaje }` si el id
  no existe.

## 7. Capa de datos del frontend (Opción A)

### 7.1 Cliente `fetch` (`src/api/client.ts`)

- `URL_API`: usa `VITE_API_BASE_URL` o `http://localhost:4000/api` como default.
- **`AbortController`**: se combina la señal externa (cancela queries de TanStack
  Query cuando el componente se desmonta) con un **timeout** de `10s`
  (`TIEMPO_ESPERA_MS`), devolviendo un error claro al agotarse.
- **Retry** con backoff (`250ms × 2^intento`) para errores de red y `5xx`; no
  reintenta `4xx` ni abortos. Las mutaciones pasan `reintentos: 0`.
- **`ErrorApi`**: error tipado con `status` y `detalle`; el mensaje respeta el
  `mensaje` del cuerpo JSON del backend (`{ ok: false, mensaje }`).
- `mensajeDeError(error)`: convierte un error desconocido en texto para la UI.

### 7.2 Endpoints (`src/api/taxtechApi.ts`)

Todos delegan en `peticion()`:

`obtenerResumenFinanciero`, `obtenerMovimientos`, `crearMovimiento`,
`actualizarMovimiento`, `eliminarMovimiento`, `sincronizarCFDI`,
`reservarImpuestos`.

### 7.3 Hooks (`src/hooks/useFinanzas.ts`)

- `useResumenFinanciero()` → clave `['resumen']`.
- `useMovimientos()` → clave `['movimientos']`.
- `clavesConsulta` se usa para invalidar queries tras mutaciones, refrescando
  Dashboard, Movimientos y Deducciones sin tocar componentes.

### 7.4 Estados de carga, error y vacío (en las 4 vistas)

- [x] **Estado de carga (`isLoading`), vacío y error coherentes en todas las
      vistas** (ítem "En cualquiera de las dos" del PLAN_MEJORA).

- `src/components/feedback/EstadoError.tsx`: mensaje + botón **"Reintentar"**
  que ejecuta `refetch()` de la consulta.
- `src/components/feedback/EstadoVacio.tsx`: estado sin datos.
- **Dashboard** (`src/views/Dashboard.tsx`): skeletons de carga; si el resumen
  falla muestra `EstadoError` (en lugar de ceros engañosos); "Movimientos
  recientes" con carga, error y vacío propios.
- **Movimientos** (`src/views/Movimientos.tsx`): skeletons, error con retry y
  vacío ("Sin movimientos todavía").
- **Deducciones** (`src/views/Deducciones.tsx`): total con skeleton; lista con
  error, carga y vacío ("Sin gastos deducibles todavía").
- **Impuestos** (`src/views/Impuestos.tsx`): skeletons de las dos tarjetas; error
  con retry; tarjetas solo cuando hay datos.

- `.env` / `.env.example` del frontend: `VITE_API_BASE_URL=http://localhost:4000/api`.
- Ningún componente importa `mockData` (grep: 0 coincidencias). El flag
  `VITE_USE_MOCK` nunca fue necesario; `mockData.ts` quedó sin consumidores.

## 8. Estructura final del backend

```text
backend TaxTech/
├── package.json
├── tsconfig.json            # strict, ES2023, module: NodeNext
├── .env.example / .env      # DATABASE_URL, PUERTO (el .env no se commitea)
├── prisma/
│   ├── schema.prisma        # Movimiento, ReservaFiscal
│   ├── migrations/          # migración inicial aplicada
│   ├── seed.ts              # 4 movimientos + 1 reserva fiscal
│   └── dev.db
└── src/
    ├── index.ts             # arranque: conecta BD + inicia Express
    ├── app.ts               # Express (json, cors, /api/estado, rutas, errores)
    ├── db.ts                # singleton del cliente Prisma
    ├── app.test.ts          # smoke / CRUD / 400 / 404 con Supertest
    ├── types.ts             # contrato espejo del frontend (DTOs)
    ├── routes/              # resumen, movimientos, impuestos, cfdi
    ├── services/            # movimientos, resumen, impuestos, taxService
    ├── middlewares/
    │   └── errorHandler.ts
    └── schemas/
        └── validators.ts    # Zod: crear/editar movimiento, reservar
```

Scripts (package.json del backend):

| Script | Comando |
|---|---|
| `dev` | `tsx watch src/index.ts` |
| `build` | `tsc -p tsconfig.json` |
| `start` | `node dist/index.js` |
| `test` | `vitest run` |
| `db:generate` | `prisma generate` |
| `db:migrate` | `prisma migrate dev --name init` |
| `db:seed` | `tsx prisma/seed.ts` |

## 9. Seguridad

- Validación **siempre** con Zod (nunca confiar en el body).
- Prisma usa consultas parametrizadas: sin SQL inyectable.
- No secretos en el repo: `.env` ignorado, `.env.example` commiteado.
- CORS limitado a los orígenes permitidos (`localhost:5173`, `127.0.0.1:5173`).
- (Futuro) Integración CFDI/SAT: la e.firma **nunca** vive en el frontend; el
  backend hará las peticiones firmadas.

## 10. Verificación

Resultados reales al cierre de la Fase 2:

| Comprobación | Resultado |
|---|---|
| Backend `npm run db:migrate` + `db:seed` | OK — `dev.db` con 4 movimientos + 1 reserva |
| Backend `npm test` | **13/13 en verde** (2 archivos) |
| Frontend `npm run lint` | Sin errores |
| Frontend `npm run build` | Compila correctamente |
| Smoke test `GET /api/resumen` | `{"ingresos":1000,"gastos":400,"deducibles":400,"impuestoEstimado":11.52,"reservaFiscal":500}` |

Comandos:

```bash
# backend
cd "backend TaxTech"
npm run db:migrate   # primera vez
npm run db:seed
npm test

# frontend
cd "frontend TaxTech"
npm run lint
npm run build
```

> Nota Windows: si `prisma generate` falla con `EPERM` sobre
> `query_engine-windows.dll.node`, detén el servidor dev en ejecución antes de
> regenerar el cliente.

### Ejecución combinada

```bash
# terminal 1 — backend
cd "backend TaxTech" && npm run dev    # http://localhost:4000

# terminal 2 — frontend
cd "frontend TaxTech" && npm run dev   # http://localhost:5173
```

Prueba manual: crear/editar/eliminar un movimiento y verificar que Dashboard,
Movimientos y Deducciones se actualizan; apagar el backend y comprobar que las
vistas muestran el estado de error con "Reintentar".

## 11. Fases de implementación (estado)

### 7.1 Setup del backend — ✅
Dependencias instaladas, `tsconfig` strict/NodeNext, `prisma init` con
`file:./dev.db`, migración inicial y seed. Aceptación cumplida.

### 7.2 Endpoints de consulta — ✅
`GET /api/resumen` calculado en `resumenService`; `GET /api/movimientos`
ordenado por fecha desc. Aceptación cumplida.

### 7.3 Endpoints de escritura — ✅
POST (201) y PATCH/DELETE validados con Zod, `POST /api/impuestos/reservar`
crea `ReservaFiscal`, `POST /api/cfdi/sincronizar` simulado. 400 claros, 404 en
ids inexistentes, resumen refleja cambios. Aceptación cumplida.

### 7.4 Conexión del frontend — ✅
`fetch` a `VITE_API_BASE_URL`, errores tipados que fluyen a TanStack Query,
invalida `clavesConsulta` tras mutaciones, CORS activado y **estados de carga,
vacío y error coherentes en todas las vistas**. Aceptación cumplida.

### 7.5 Testing y hardening — ✅
Unit `calcularISR` + integration Supertest (CRUD, resumen, 400, 404),
`errorHandler` centralizado. Aceptación cumplida (13/13).

## 12. Entregables de la Fase 2

1. ✅ `backend/` funcional con API REST documentada (este contrato).
2. ✅ `taxtechApi.ts` consumiendo la API real (mock sin consumidores).
3. ✅ Tests de `taxService` y smoke tests de rutas.
4. ✅ Sección en `docs/` con el estado final y decisiones (este documento).

## 13. Riesgos

| Riesgo | Mitigación |
|---|---|
| Reglas fiscales cambian | Tarifa ISR en tabla por año y versionada; `taxService` aislado. |
| Prisma requiere binario nativo | `better-sqlite3` es el plan B (SQL crudo + tipado manual). |
| Crecimiento del modelo | SQLite migra a PostgreSQL cambiando solo `DATABASE_URL`. |

## 14. Pendientes para la Fase 3

- Formulario de alta/edición de movimientos y eliminación con confirmación.
- Marcar/desmarcar manualmente un gasto como deducible (lista dinámica).
- Cálculo real de ISR en frontend para configuración de reserva (% a reservar),
  conectando el endpoint `reservarImpuestos` (hoy sin UI).
- Gráfica simple de ingresos vs gastos por mes en el Dashboard.
- Borrar `src/data/mockData.ts` (sin consumidores).

opencode -s ses_f66cf7495ffedx7IMqzVNltMPl