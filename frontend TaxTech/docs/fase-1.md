# Fase 1 — Base de código, Dashboard maximalista y fix de layout

Fecha de implementación: 2026-09-12

## Resumen

La Fase 1 sentó los cimientos del proyecto (tipos, router, capa de datos), rediseñó
el Dashboard con una dirección visual maximalista y navegable, y corrigió el layout
para que el sidebar nunca tape el contenido. Corresponde a la
[Fase 1 del PLAN_MEJORA.md](../PLAN_MEJORA.md).

---

## 1. Base de código sólida (tipos, router, estado)

### 1.1 Tipos de dominio (`src/types/index.ts`)

| Tipo | Descripción |
|---|---|
| `TipoMovimiento` | `'Ingreso' \| 'Gasto'` |
| `Movimiento` | id (UUID string), concepto, tipo, monto, fecha, categoria, deducible |
| `ResumenFinanciero` | ingresos, gastos, deducibles, impuestoEstimado, reservaFiscal |
| `ResultadoSincronizacion` | resultado de la simulación de CFDI |
| `ResultadoReserva` | resultado de reservar impuestos |

Nota: se usan string union types en lugar de `enum` porque el proyecto tiene
`erasableSyntaxOnly` habilitado (no permite enums en tiempo de ejecución).

### 1.2 Datos simulados tipados (`src/data/mockData.ts`)

- El array de `movimientos` está tipado como `Movimiento[]`.
- Cada movimiento tiene **UUID**, **fecha** ISO, **categoría** y flag
  **deducible** (antes eran ids numéricos 1-3).
- Se añadió el movimiento "Internet" para que Deducciones tenga más de un elemento.
- `resumenFinanciero` está tipado como `ResumenFinanciero`.

### 1.3 Router (`react-router-dom`)

Dependencia instalada: `react-router-dom`.

- `src/App.tsx` dejó de usar `useState` + `switch` y ahora es declarativo con
  `<Routes>` / `<Route>`:

| Ruta | Vista |
|---|---|
| `/` | Dashboard |
| `/movimientos` | Movimientos |
| `/deducciones` | Deducciones |
| `/impuestos` | Impuestos |
| `*` | Redirección a `/` |

- Ventajas: URLs reales, back/forward del navegador, deep-linking y lugar natural
  para rutas futuras.

### 1.4 Capa de estado (TanStack Query)

Dependencia instalada: `@tanstack/react-query`.

- `src/main.tsx` envuelve la app con `QueryClientProvider`.
- `QueryClient` configurado con `staleTime: 60s` y `retry: 1`.
- Nuevo `src/hooks/useFinanzas.ts` con hooks + claves de consulta:
  - `useResumenFinanciero()` → `['resumen']`
  - `useMovimientos()` → `['movimientos']`
- Las vistas ya no importan `mockData` directamente; consumen los hooks. Cuando la
  API real exista, solo cambiará `taxtechApi.ts` sin tocar componentes.

**Decisión: TanStack Query vs Zustand.** Se eligió TanStack Query porque los datos
son remotos (o simularán serlo): queries, cache, retry e `isLoading`/`isError`
integrados. El estado global de UI/sesión es mínimo hoy; si más adelante fuera
necesario, Zustand se integra sin conflicto (solo para UI/sesión, no para datos).

### 1.5 Utilidades de formato (`src/utils/format.ts`)

- `formatearMoneda(valor)` → moneda MXN con `Intl.NumberFormat('es-MX')`,
  reemplazando el código duplicado en StatCard, Dashboard y Movimientos.
- `formatearFecha(valor)` → fecha legible es-MX.

### 1.6 Tema y componentes base de Tailwind (`src/index.css`)

- Capa de componentes con sintaxis de Tailwind v4:
  - `.card` → contenedor blanco redondeado con sombra y `ring-1 ring-black/5`.
  - `.btn-primary` → botón principal.
  - `.btn-accent` → botón degradado violeta → fucsia → ámbar con glow.
- **Tipografía Outfit** (Google Fonts) vía `@theme { --font-sans: ... }`.

### 1.7 `src/api/taxtechApi.ts`

Las funciones ahora tienen **tipos de retorno** (`Promise<ResumenFinanciero>`,
`Promise<Movimiento[]>`, etc.) usando `mockData` aún.

---

## 2. Rediseño del Dashboard (maximalista y responsive)

### 2.1 Problemas resueltos

1. **No se podía navegar a Deducciones ni Impuestos desde el Dashboard**: las
   tarjetas eran inertes. Ahora todas las métricas son enlaces.
2. **Diseño pobre y estático**: se aplicó una dirección maximalista (gradientes,
   tipografía display, decoración, hover effects).
3. **No era responsive**: grillas fijas (`grid-cols-4`, `grid-cols-2`) rompían en
   móvil.

### 2.2 Iconos (`src/components/icons.tsx`)

Conjunto SVG propio (stroke `currentColor`), sin dependencias: `IconoIngresos`,
`IconoGastos`, `IconoDeducibles`, `IconoImpuesto`, `IconoFlecha`,
`IconoFlechaEsquina`, `IconoVistaPrevia`, `IconoBanca`.

### 2.3 StatCard navegable (`StatCard.tsx`)

Nuevas props:
- `destino?: string` → si existe, la tarjeta es un `<Link>`.
- `icono` → badge con gradiente. `colorBadge` / `colorBar` → gradiente del badge y
  barra de acento superior. `pie` → texto secundario.

Comportamiento: hover que eleva la tarjeta, sombra intensa y flecha animada; barra
de color superior que identifica la métrica.

### 2.4 Dashboard maximalista (`Dashboard.tsx`)

- **Encabezado de marca**: eyebrow "PANEL FINANCIERO" + título degradado
  (violeta → fucsia → ámbar) y botón "Sincronizar CFDI" (`btn-accent`).
- **Fondo decorativo**: orbes borrosos detrás del contenido.
- **Hero banner**: degradado oscuro (slate → violeta → fucsia) con saldo neto a
  gran tamaño y chips glassmorphism (Ingresos, Gastos, Reserva fiscal).
- **Métricas clicables** y **Movimientos recientes** con enlace "Ver todos →".
- **Reserva fiscal**: tarjeta degradada hacia `/impuestos` con barra de
  **cobertura del impuesto estimado** (`reservaFiscal / impuestoEstimado`).
- **Carga dinámica**: skeletons (`animate-pulse`) mientras consulta.

### 2.5 Navegación responsive (unificada en el sidebar)

- **`Sidebar.tsx`**: navegación **siempre visible** como lista vertical:
  - `md+`: columna fija a la izquierda (256px) con degradado slate → violeta y
    nicho informativo en el pie.
  - Móvil: bloque superior a ancho completo con la misma lista vertical (todas las
    opciones visibles y seleccionables, sin listas horizontales).
- **`Layout.tsx`**: `flex-col` en móvil (sidebar arriba, contenido abajo) y
  `flex-row` en `md+` (sidebar izquierdo, contenido al lado).
- El **`MobileNav`** (barra superior con píldoras horizontales) fue eliminado por
  petición del usuario.

### 2.6 Coherencia en las demás vistas

Movimientos, Deducciones e Impuestos adoptan el mismo encabezado de marca
(eyebrow + título degradado). Sus grillas ahora son responsive
(`grid-cols-1 sm:grid-cols-2`).

### 2.7 Mapa de navegación del Dashboard

| Elemento | Acción |
|---|---|
| Ingresos / Gastos | → `/movimientos` |
| Deducibles | → `/deducciones` |
| Impuesto estimado | → `/impuestos` |
| Reserva fiscal (hero y card) | → `/impuestos` |
| Movimientos recientes | → `/movimientos` |

---

## 3. Fix del layout (el sidebar ya no cubre el contenido)

### 3.1 Problema

1. La columna de contenido tenía `md:min-w-fit` (`min-width: fit-content`). Si el
   contenido superaba el ancho disponible, el contenedor flex crecía más allá del
   viewport mientras el sidebar mantenía sus 256px: el sidebar "tapaba" contenido
   y se generaba scroll horizontal.
2. El sidebar era `sticky top-0` con `h-screen` dentro de un contenedor con altura
   dependiente del contenido (`min-h-screen`): combinación frágil que podía
   solapar al hacer scroll.

### 3.2 Solución (app-shell)

```tsx
<div className="flex h-screen flex-col overflow-hidden bg-slate-100 md:flex-row">
  <Sidebar />                                  // lista vertical (arriba en móvil, columna en md+)
  <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
    <main className="flex-1"><Outlet /></main> // scroll aquí
  </div>
</div>
```

- Raíz con `h-screen overflow-hidden`: altura fija, sin scroll de página.
- Columna de contenido con `min-w-0 flex-1` y `overflow-y-auto`: el scroll ocurre
  solo dentro de ella; el sidebar queda fijo y completo.
- `min-w-0` previene el desbordamiento clásico de flex (`fit-content`).

---

## 4. Archivos afectados (estado final de la Fase 1)

Nuevos:
- `src/types/index.ts`
- `src/utils/format.ts`
- `src/hooks/useFinanzas.ts`
- `src/components/Layout.tsx`
- `src/components/icons.tsx`
- `docs/README.md`

Modificados:
- `src/index.css`
- `src/main.tsx`
- `src/App.tsx`
- `src/components/Sidebar.tsx`
- `src/components/StatCard.tsx`
- `src/data/mockData.ts`
- `src/api/taxtechApi.ts`
- `src/views/Dashboard.tsx`
- `src/views/Movimientos.tsx`
- `src/views/Deducciones.tsx`
- `src/views/Impuestos.tsx`
- `package.json` / `package-lock.json`

Eliminados:
- `src/assets/hero.png`, `src/assets/react.svg`, `src/assets/vite.svg` + carpeta
  `src/assets` (Fase 0, higiene)
- `src/components/MobileNav.tsx` (navegación absorbida por el sidebar)

## 5. Verificación

```bash
npm run lint   # sin errores
npm run build  # compila correctamente
```

Prueba manual recomendada: redimensionar entre `md` (768px) y `lg` (1024px) y
verificar que no aparezca scroll horizontal ni superposición; en móvil, comprobar
que las 4 opciones de navegación se ven y seleccionan.

## 6. Pendientes para la Fase 2

Los componentes ya no dependen de `mockData` (todo pasa por hooks/API). La Fase 2
consistirá en sustituir `taxtechApi.ts` por `fetch` real (o MSW) y añadir estados
de error/vacío explícitos (hoy `isLoading` solo muestra skeletons). Parte de la
Fase 4 (UX/UI responsive) quedó adelantada; faltan toasts de confirmación y
mejoras de accesibilidad (aria en navegación).