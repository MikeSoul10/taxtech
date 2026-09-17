# Fase 3 — Funcionalidad completa (gestión)

- Fecha del plan: 2026-09-16
- Fecha de implementación: 2026-09-16
- Estado: **implementado y verificado**

## 0. Resumen

La Fase 3 lleva a TaxTech de "consulta" a "gestión": el usuario ahora puede
**crear, editar y eliminar** movimientos, **marcar/desmarcar** gastos como
deducibles, **reservar impuestos con un porcentaje configurable**, y el
Dashboard muestra un **cálculo de ISR real (LISR)** con tope de deducciones y
una **gráfica de ingresos vs gastos por mes**. Corresponde a la
[Fase 3 del PLAN_MEJORA.md](../PLAN_MEJORA.md).

**Criterio de aceptación cumplido:** flujos CRUD completos, cálculo de
impuestos reproducible (espejo frontend/backend) y unit-testeado en ambos
proyectos.

## 1. Movimientos — CRUD completo

### 1.1 Alta y edición

- Nuevo formulario modal (`src/components/movimientos/FormularioMovimiento.tsx`)
  con campos: **concepto**, **tipo** (Ingreso/Gasto), **monto (MXN)**, **fecha**,
  **categoría** y **¿deducible?**.
- Se reutiliza para alta y edición (mismo componente, distinto "modo").
- La categoría es un input libre con `datalist` de las categorías existentes.
- El check "Deducible" se desactiva automáticamente cuando el tipo es Ingreso.
- Envía `POST /movimientos` (crear) o `PATCH /movimientos/:id` (editar) con
  validación del backend (Zod).

### 1.2 Eliminación con confirmación

- Botón "Eliminar" por fila → `window.confirm` con el concepto → `DELETE
  /movimientos/:id`. Estados `404` manejados por el cliente `fetch` (ErrorApi).

### 1.3 Búsqueda y filtros

En `src/views/Movimientos.tsx`, barra de filtros con:

| Filtro | Comportamiento |
|---|---|
| Búsqueda | `concepto` contiene el texto (case-insensitive) |
| Tipo | Todos / Ingreso / Gasto |
| Mes | derivado de `fecha.slice(0,7)` (YYYY-MM), etiquetas es-MX |
| Categoría | lista única de categorías existentes |

- Los filtros se combinan (no mutuamente excluyentes) vía `useMemo`.
- Estado vacío distingue "sin movimientos en absoluto" vs "sin resultados con
  los filtros actuales".

## 2. Deducciones — toggle manual

- `src/views/Deducciones.tsx` ahora lista **todos los gastos** (no solo los
  deducibles) con un **switch** por fila que llama `PATCH /movimientos/:id`
  con `{ deducible: !actual }`.
- La lista es **dinámica**: ya no hay valores hardcodeados; sale de
  `useMovimientos()` y se refresca con la invalidación de TanStack Query.
- Total potencialmente deducible se toma de `useResumenFinanciero()`.
- Muestra contador "X de Y gastos marcados como deducibles".
- Pendiente de petición: el switch se deshabilita mientras hay un toggle en
  curso (por fila y globalmente).

## 3. Impuestos — cálculo real de ISR

### 3.1 `src/utils/tax.ts` (nuevo, testeable)

La lógica de ISR vive ahora en un **módulo puro del frontend**, espejo del
`taxService.ts` del backend:

- `TARIFA_ISR_2026`: 11 tramos anuales de la **LISR** (límite inferior,
  límite superior, cuota fija y **excedente / coeficiente** por tramo,
  1.92 % → 35 %).
- `topeDeducciones(ingresos, deducibles)`: las deducciones aplicables se
  limitan al **10 % de los ingresos** del periodo.
- `calcularBaseGravable(ingresos, deducibles)`: `ingresos − tope`, nunca
  negativa.
- `obtenerTramo(baseGravable)`: devuelve el tramo aplicable (para desglose).
- `calcularISR(baseGravable)` → `calcularBaseGravable` + tarifa.
- `estimarImpuesto(ingresos, deducibles)`: el cálculo usado por el resumen.

### 3.2 Vista Impuestos — desglose y reserva

- **Desglose del cálculo** (en UI): ingresos, deducciones aplicadas (tope
  10 %), base gravable, tramo/coeficiente e ISR estimado. Calculado en el
  frontend con `tax.ts`, consistente con el `impuestoEstimado` que devuelve la
  API.

## 4. Reserva fiscal configurable

- Endpoint `POST /impuestos/reservar` **ahora sí tiene UI**.
- El usuario elige un **% de ingresos** a reservar (chips rápidos
  10/15/20/25/30 % o entrada numérica 0–100).
- Se muestra el monto resultante en vivo (`ingresos × %`).
- Botón "Reservar X % de ingresos" → llama `reservarImpuestos(cantidad)` →
  invalida `resumen` → la tarjeta "Reserva fiscal actual" y el Dashboard se
  actualizan en tiempo real.
- Errores (backend caído, cantidad <= 0) se muestran en un banner.

## 5. Dashboard — API en tiempo real + gráfica

- Todo llega por la capa de API (TanStack Query); las mutaciones invalidan
  `['resumen']` y `['movimientos']` vía hooks de mutación, por lo que
  Dashboard, Movimientos y Deducciones **reflejan los cambios sin recargar**.
- Nueva tarjeta **"Ingresos vs gastos por mes"**
  (`src/components/GraficoIngresosGastos.tsx`): gráfica de barras 100 % CSS
  (sin dependencias), agrupa movimientos por mes (tipo + año), barras verdes
  (ingresos) y rojas (gastos), con tooltip del monto y leyenda.

## 6. Backend — tope de deducciones

`src/services/taxService.ts` evolucionó (tal como preveía la Fase 2):

- `topeDeducciones`, `calcularBaseGravable` y `estimarImpuesto`.
- `resumenService` ahora usa `estimarImpuesto(ingresos, deducibles)` en vez de
  `calcularISR(ingresos − deducibles)`:
  - Antes: base = ingresos − deducibles (sin tope).
  - Ahora: base = ingresos − min(deducibles, 10 % de ingresos).

Ejemplo con el seed: ingresos 1000, deducibles 400 → tope 100 → base 900 →
ISR 17.28 (antes 11.52 con base 600).

## 7. Testing

### Backend (Vitest + Supertest)

| Archivo | Casos |
|---|---|
| `taxService.test.ts` | `calcularISR` (0/negativos, tramos), `topeDeducciones` (10 %), `calcularBaseGravable`, `estimarImpuesto` |
| `app.test.ts` | smoke CRUD, resumen, 400/404, reserva, CFDI |

Resultado: **2 archivos, 19/19 en verde** (antes 13).

### Frontend (Vitest, nuevo)

- `src/utils/tax.test.ts`: mismos casos de `calcularISR` + `obtenerTramo`,
  tope, base gravable y `estimarImpuesto`. Resultado: **12/12 en verde**.
- Script `npm test` añadido en `frontend TaxTech/package.json` y
  `vitest.config.ts`.

## 8. Higiene

- **Eliminado `src/data/mockData.ts`** (sin consumidores desde la Fase 2;
  pendiente listado en `docs/fase-2.md`).

## 9. Archivos afectados

Nuevos (frontend):
- `src/utils/tax.ts` y `src/utils/tax.test.ts`
- `src/components/movimientos/FormularioMovimiento.tsx`
- `src/components/Modal.tsx`
- `src/components/feedback/Aviso.tsx`
- `src/components/GraficoIngresosGastos.tsx`
- `vitest.config.ts`

Modificados:
- `src/hooks/useFinanzas.ts` (mutaciones + invalidación)
- `src/views/Movimientos.tsx` (CRUD, búsqueda, filtros)
- `src/views/Deducciones.tsx` (toggle deducible)
- `src/views/Impuestos.tsx` (desglose ISR + reserva %)
- `src/views/Dashboard.tsx` (gráfica mensual)
- `package.json` y `package-lock.json` (vitest, script `test`)

Modificados (backend):
- `src/services/taxService.ts` (tope de deducciones)
- `src/services/resumenService.ts` (usa `estimarImpuesto`)
- `src/services/taxService.test.ts` (nuevos casos)

Eliminados:
- `src/data/mockData.ts`

## 10. Verificación

| Comprobación | Resultado |
|---|---|
| Backend `npm test` | **19/19 en verde** |
| Backend `npm run build` | Compila sin errores |
| Frontend `npm run lint` | Sin errores |
| Frontend `npm run build` | Compila sin errores |
| Frontend `npm test` | **12/12 en verde** |
| Smoke E2E (API real) | Crear/PATCH deducible/eliminar/reservar OK; resumen se actualiza en vivo |

Comandos:

```bash
# backend
cd "backend TaxTech"
npm run db:migrate   # solo la primera vez (o tras clonar)
npm run db:seed
npm test

# frontend
cd "frontend TaxTech"
npm run lint
npm run test
npm run build
```

> Nota: se creó el `.env` local del backend (copiado de `.env.example`) con
> `DATABASE_URL="file:./dev.db"` y `PUERTO=4000`; no se commitea.

```bash
# terminal 1 — backend
cd "backend TaxTech" && npm run dev    # http://localhost:4000

# terminal 2 — frontend
cd "frontend TaxTech" && npm run dev   # http://localhost:5173
```

## 11. Prueba manual sugerida

1. Crear un gasto deducible → debe aparecer en Movimientos y en el switch de
   Deducciones; el total deducible del resumen se actualiza.
2. Editar su monto y verificar que Dashboard/Impuestos se recalculan.
3. Eliminar con confirmación.
4. Marcar/desmarcar deducible desde Deducciones y ver el contador.
5. En Impuestos: revisar el desglose y reservar un 20 % → la reserva fiscal
   aumenta en Dashboard y en la tarjeta.
6. Comprobar la gráfica mensual con datos de más de un mes.

## 12. Decisiones registradas

| Decisión | Elección | Por qué |
|---|---|---|
| Cálculo ISR | Espejo `tax.ts` (frontend) ↔ `taxService.ts` (backend) | Reproducible y testeable, mismo resultado en UI y API |
| Tope de deducciones | 10 % de ingresos | Regla de la LISR/RESICO relevante para freelancers |
| Gráfica | Barras 100 % CSS sin librería | Acorde al proyecto sin dependencias de UI |
| Reserva | % configurable sobre ingresos | Coherente con el objetivo "reservar contra tus ingresos" |
| Confirmación de borrado | `window.confirm` nativo | Sin dependencias, semilla de la Fase 4 (toasts accesibles) |
| Formulario | Modal reutilizable | Alta y edición comparten esquema y validaciones |