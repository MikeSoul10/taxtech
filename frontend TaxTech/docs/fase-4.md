# Fase 4 — Experiencia de usuario, responsive y accesibilidad

- Fecha del plan: 2026-09-17
- Fecha de implementación: 2026-09-17
- Estado: **implementado y verificado**

## 0. Resumen

La Fase 4 eleva la percepción de calidad del producto sin cambiar la lógica:
el layout **se adapta a móvil** (sidebar colapsable con menú hamburguesa), todas
las vistas tienen **estados de carga, vacío y error con reintento**, se
refuerza la **accesibilidad** (roles, `aria-*`, foco visible, teclado,
`prefers-reduced-motion`, contraste), se añade un **toast/snackbar** para
confirmación de acciones y se **centraliza la internacionalización** de fechas y
monedas en `es-MX`. Corresponde a la
[Fase 4 del PLAN_MEJORA.md](../PLAN_MEJORA.md).

**Criterio de aceptación:** auditoría de Lighthouse sin errores críticos y la
app usable desde un celular.

## 1. Responsive — grillas y layout

- **Sidebar colapsable en móvil** (`src/components/Sidebar.tsx`):
  - Barra superior única en `< md` con botón hamburguesa
    (`aria-expanded`, `aria-controls="menu-lateral-movil"`).
  - Drawer deslizante con **backdrop** para cerrar, transición
    `translate-x`, y cierre con la tecla **Escape**.
  - En escritorio (≥ `md`) sigue el sidebar fijo a la izquierda.
- **Breakpoints sensatos en todas las grillas** (se elimina el `grid-cols-4`
  fijo que rompía en móvil):
  - Dashboard: `grid-cols-1 → sm:grid-cols-2 → lg:grid-cols-4`.
  - Filtros de Movimientos: `grid-cols-1 → sm:grid-cols-2 → xl:grid-cols-4`.
  - Tarjetas de Impuestos y desglose: `grid-cols-1 → sm:grid-cols-2`.
  - Padding y tipografía escalan con `sm:`/`lg:` (`p-4 sm:p-6 lg:p-8`).

## 2. Estados de carga, vacío y error

En `src/components/feedback/` (reutilizados por las cuatro vistas):

| Componente | Uso |
|---|---|
| `EstadoVacio.tsx` | "Sin movimientos todavía", "Sin gastos todavía" y "Sin resultados con los filtros actuales", con texto opcional e icono |
| `EstadoError.tsx` | Banner con `role="alert"` y botón **Reintentar** (`onReintentar` → `refetch`) |
| `Aviso.tsx` | Confirmación/error de acciones del formulario (éxito/error) |

- **Skeletons de carga** con `role="status"`, `aria-busy` y `aria-label`
  descriptivo en Dashboard (tarjetas), Movimientos (filas), Deducciones (total
  y lista) e Impuestos (tarjetas).
- Movimientos distingue "sin movimientos en absoluto" vs. "sin resultados con
  los filtros actuales" (estado vacío contextual).

## 3. Accesibilidad

- **Roles ARIA**:
  - Modales: `role="dialog"`, `aria-modal`, `aria-label`.
  - Switches de Deducciones: `role="switch"` + `aria-checked`.
  - Barras de cobertura: `role="progressbar"` con `aria-valuenow/max/min`.
  - `role="status"` / `aria-live="polite"` para toasts, avisos y vacíos;
    `role="alert"` / `aria-live="assertive"` para errores.
- **Etiquetas semánticas**: `aria-label` en botones de iconos (marcar como
  deducible, sincronizar CFDI, cerrar menú, cerrar notificación) y en
  selectores (buscar, filtrar por tipo/mes/categoría).
- **Teclado**: enlace "Saltar al contenido principal" al inicio de `Layout`,
  `<main tabIndex={-1}>` enfocable, cierre de drawer con Escape.
- **Foco visible**: `:focus-visible` global con outline violeta de 2px en
  `index.css` y `focus-visible:ring-*` en botones/links/inputs.
- **Contraste AA**: texto sobre fondos oscuros (slate-900/violet-950) con
  variantes claras; botones con hover/disabled diferenciados.
- **Movimiento reducido**: media query `prefers-reduced-motion: reduce` que
  anula animaciones/transiciones.

## 4. Micro-interacciones — toast/snackbar

- `src/components/Layout.tsx` expone un **toast accesible** mediante el contexto
  `notificar(mensaje, tipo)` (vía `useOutletContext`).
- Tipos: `exito` / `error` / `info`; estilos y colores propios, icono, botón de
  cierre y auto-ocultado a los 4 s.
- El componente de Dashboard lo usa para la **sincronización CFDI** (éxito y
  error); Movimientos/Deducciones/Impuestos muestran `Aviso` tras cada acción.

## 5. Internacionalización centralizada

- `src/utils/format.ts` concentra los formateadores `es-MX`:
  - `formatearMoneda` (MXN, 0–2 decimales).
  - `formatearFecha` / `formatearFechaLarga`.
  - `formatearPorcentaje`.
- Todas las vistas consumen estas utilidades; ya no hay formato de moneda/fecha
  duplicado en los componentes.

## 6. Identidad visual y base de estilos

- `index.html`: `lang="es"`, `viewport`, `meta description`, `theme-color` y
  título descriptivo + favicon.
- `src/index.css`: fuente **Outfit** (variable `--font-sans`), clases utilitarias
  `.card`, `.btn-primary`, `.btn-accent`, `.btn-secondary`, reglas de foco y
  movimiento reducido.

## 7. Archivos afectados

Modificados:
- `src/components/Sidebar.tsx` (menú hamburguesa, drawer, backdrop, Escape)
- `src/components/Layout.tsx` (toast, skip-link, contexto `notificar`)
- `src/components/StatCard.tsx` (aria-label + métricas, foco visible)
- `src/components/feedback/EstadoError.tsx` y `EstadoVacio.tsx` (roles/live)
- `src/components/icons.tsx` (iconos nuevos para interacciones)
- `src/views/Dashboard.tsx`, `Movimientos.tsx`, `Deducciones.tsx`,
  `Impuestos.tsx` (skeletons, estados vacíos/error, responsive, aria)
- `src/utils/format.ts` (utilidades es-MX centralizadas)
- `src/index.css` (fuente, focus-visible, reduced-motion, componentes base)
- `index.html` (metadatos, idioma, viewport)
- `PLAN_MEJORA.md` (marcar la Fase 4 como completada)

## 8. Verificación

| Comprobación | Resultado |
|---|---|
| Frontend `npm run lint` | Sin errores |
| Frontend `npm run build` | Compila sin errores |
| Navegación en móvil (ancho < 768px) | Sidebar hamburguesa abre/cierra; body scroll bloqueado; Escape cierra |
| Estados de UI | Skeletons, vacíos y errores con Reintentar en las 4 vistas |
| Auditoría Lighthouse | Sin errores críticos (criterio de la fase) |

## 9. Decisiones registradas

| Decisión | Elección | Por qué |
|---|---|---|
| Menú móvil | Drawer con backdrop + Escape | Patrón estándar y accesible; sin librerías |
| Toast | Contexto `notificar` en Layout | Sin dependencias; centraliza micro-interacciones |
| Confirmaciones | `Aviso` tras la acción (además del `window.confirm` nativo de borrado) | Feedback no invasivo dentro de la vista |
| Foco visible | `:focus-visible` global + focus ring por componente | Visibilidad sin molestar al ratón |
| Movimiento reducido | `prefers-reduced-motion` | Requisito de accesibilidad (WCAG) |
| Formato es-MX | `Intl` en `src/utils/format.ts` | Centralizado y testeable (ver Fase 5) |