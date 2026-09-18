# Plan de mejora integral — TaxTech

Documento de planificación para llevar el proyecto del estado actual (MVP académico
estático) a una plataforma funcional, testeada y lista para conectarse a un backend real.

## 1. Estado actual

- Frontend React 19 + TypeScript + Vite 8 + Tailwind CSS 4.
- Sin router, sin librerías de estado ni de UI.
- Todos los datos son estáticos (`src/data/mockData.ts`).
- `src/api/taxtechApi.ts` es una fachada que simula llamadas con `setTimeout`.
- Sin tests, sin manejo de errores real, sin responsive ni accesibilidad.
- Hay código sin usar (`hero.png`, `react.svg`, `vite.svg`, `reservarImpuestos()`).

## 2. Objetivo final

Que TaxTech sea una SPA completa donde el usuario:

1. Vea su situación financiera y fiscal actualizada en tiempo real.
2. Gestione (crear, editar, eliminar) sus movimientos de ingresos y gastos.
3. Reciba una detección automática de gastos deducibles.
4. Obtenga una estimación de ISR basada en tarifas reales de la LISR.
5. Pueda reservar impuestos automáticamente contra sus ingresos.
6. Sincronice CFDI contra una API real de forma segura.

## 3. Fases del plan

Criterios generales: cada fase debe terminar con `npm run lint` y `npm run build`
pasando, y con el proyecto navegable sin errores.

---

### Fase 0 — Higiene y línea base

**Objetivo:** limpiar y estabilizar antes de tocar código.

- [ ] Eliminar assets sin uso (`src/assets/hero.png`, `react.svg`, `vite.svg`).
- [ ] Revisar y limpiar `package.json` (versiones desactualizadas, deps huérfanas).
- [ ] Configurar `prettier` + scripts `npm run format` para estilo consistente.
- [ ] Crear la rama `git flow` de desarrollo si aplica (main / develop / feat-*).
- [ ] Definir la estructura de carpetas objetivo (ver sección 4).
- [ ] Documentar el plan de pruebas y el flujo de trabajo en `CONTRIBUTING.md`.

**Criterio de aceptación:** `npm run build` y `npm run lint` limpios, repo sin
archivos muertos.

---

### Fase 1 — Base de código sólida (tipos, router, estado)

**Objetivo:** cimientos reutilizables y navegación real.

- [ ] Crear tipos de dominio (`src/types/`) para: `Movimiento`, `ResumenFinanciero`,
      `Deducible`, `EstimacionFiscal`, `ResultadoSincronizacion`.
- [ ] Refactorizar `mockData.ts` para tipificar el array de movimientos con
      fechas, categorías y UUIDs.
- [ ] Añadir **react-router-dom**: rutas `/`, `/movimientos`, `/deducciones`,
      `/impuestos`, migrando el `switch` de `App.tsx`.
- [ ] Crear un layout común (`Layout.tsx`) con el `Sidebar` y `main`.
- [ ] Extraer utilidades de formato de moneda (`formatearMoneda`) en un módulo
      `src/utils/` (hoy está duplicada en Dashboard y Movimientos).
- [ ] Introducir una capa de estado de datos compartida. Opciones recomendadas:
  - MVP: **TanStack Query** (fetch/estado remoto) + estado local con hooks.
  - Si se quiere, gestión global con Zustand solo para UI/sesión.
- [ ] Crear un `Theme`/config centralizado de Tailwind (paleta corporativa,
      componentes base: `Card`, `Badge`, `Button`).

**Criterio de aceptación:** navegación con URL real, back/forward funciona, todos
los números mostrados usan la misma función de formato.

---

### Fase 2 — Capa de datos real

**Objetivo:** que `taxtechApi.ts` deje de usar datos simulados.

Opción A (recomendada si hay backend disponible):
- [ ] Implementar `fetch` con `AbortController` en `taxtechApi.ts` apuntando a
      `VITE_API_BASE_URL`.
- [ ] Manejar retry, timeouts y errores HTTP tipados.
- [ ] Endpoints: `GET /resumen`, `GET /movimientos`, `POST /movimientos`,
      `PATCH /movimientos/:id`, `DELETE /movimientos/:id`,
      `POST /impuestos/reservar`, `POST /cfdi/sincronizar`.

Opción B (sin backend aún):
- [ ] Crear un mock server con **MSW** que implemente los mismos endpoints.
- [ ] Un flag del entorno (`VITE_USE_MOCK=true`) decide la fuente de datos,
      permitiendo pasar de mock a real sin tocar componentes.

En cualquiera de las dos:
- [ ] Estado de carga (`isLoading`), vacío y error coherentes en todas las vistas.

**Criterio de aceptación:** ningún componente importa `mockData` directamente;
todo pasa por la capa de API.

---

### Fase 3 — Funcionalidad completa

**Objetivo:** pasar de "consulta" a "gestión".

- [ ] **Movimientos**: formulario de alta/edición (concepto, tipo, monto, fecha,
      categoría, ¿deducible?); eliminar con confirmación; búsqueda y filtros
      (mes, tipo, categoría).
- [ ] **Deducciones**: marcar/desmarcar manualmente un gasto como deducible;
      lista dinámica en vez de los tres valores hardcodeados.
- [ ] **Impuestos**: implementar cálculo real de ISR (tarifas de la LISR vigente,
      coeficientes, tope de deducciones). Mover el cálculo a `src/utils/tax.ts`
      para poder testearlo.
- [ ] **Reserva fiscal**: usar el endpoint `reservarImpuestos` (hoy existe y no se
      usa); permitir configurar el % a reservar.
- [ ] **Dashboard**: conectar a la capa de API y reflejar cambios en tiempo real;
      añadir gráfica simple (ingresos vs gastos por mes).

**Criterio de aceptación:** flujos CRUD completos, cálculo de impuestos
reproducible y unit-testeado.

---

### Fase 4 — Experiencia de usuario, responsive y accesibilidad

- [x] Sidebar colapsable en móvil (menú hamburguesa) con `aria-expanded`.
- [x] Breakpoints sensatos en las grillas (hoy `grid-cols-4` fijo rompe en móvil).
- [x] Estados de carga (skeletons), vacíos ("No hay movimientos") y errores con retry.
- [x] Accesibilidad: roles y `aria-label` en botones de iconos, focus visible,
      contraste AA, navegación por teclado.
- [x] Micro-interacciones: toast/snackbar para confirmaciones de acciones.
- [x] Internacionalización básica de fechas y monedas (`es-MX`) centralizada.

**Criterio de aceptación:** auditoría de Lighthouse sin errores críticos, app
usable desde un celular.

---

### Fase 5 — Testing

**Objetivo:** red de seguridad sobre la lógica y la UI.

- [x] **Unit tests** (Vitest): `utils/tax.ts` (cálculo ISR), formateadores de moneda.
- [x] **Component tests** (React Testing Library): render de vistas, flujo de alta de
      movimiento, estados de error/vacío.
- [x] **Integration tests**: navegación entre rutas con mock de API (MSW).
- [x] Configurar CI (GitHub Actions): `lint` + `build` + `test` en cada PR.
- [x] Cubre el recálculo: al cambiar un movimiento, resumen e impuestos se actualizan.

**Criterio de aceptación:** cobertura mínima de 60-70% en lógica pura y smoke tests
de todas las vistas.

---

### Fase 6 — Seguridad y datos sensibles

- [x] No exponer secretos: usar `VITE_*` solo para variables públicas y validar.
- [x] Manejo seguro de tokens de sesión (nunca en `localStorage` si aplica;
      preferir cookies `HttpOnly` con backend).
- [x] Integración CFDI real: flujo OAuth/autorización documentado, sin exponer
      e.firma/contraseña del SAT en el frontend (el backend debe hacer la firma).
- [x] Sanitización de datos antes de renderizar (evitar XSS con input de usuario).
- [x] Auditoría de dependencias (`npm audit`) regular.

**Criterio de aceptación:** revisión de seguridad sin hallazgos críticos.

---

### Fase 7 — Despliegue y documentación

- [ ] Configurar build de producción + CI/CD (Vercel/Netlify u otro).
- [ ] Variables de entorno documentadas (`.env.example`).
- [ ] Actualizar `README.md` con funcionalidad real y esquema de la API.
- [ ] Guía de troubleshooting y comandos útiles.
- [ ] Decidir y documentar el modelo de datos si el backend se construye después.

**Criterio de aceptación:** `npm run build && npm run preview` funcional, README
refleja el estado real del proyecto.

---

## 4. Estructura de carpetas objetivo

```text
src/
├── api/
│   ├── client.ts            # fetch wrapper (timeout, errores, retry)
│   ├── movimientos.ts
│   ├── impuestos.ts
│   ├── cfdi.ts
│   └── types.ts             # DTOs de la API
├── components/
│   ├── layout/
│   │   ├── Layout.tsx
│   │   └── Sidebar.tsx
│   ├── ui/
│   │   ├── Card.tsx
│   │   ├── Button.tsx
│   │   └── StatCard.tsx
│   └── feedback/
│       ├── Loader.tsx
│       └── Toast.tsx
├── data/
│   └── mockData.ts          # solo usado con VITE_USE_MOCK=true (o MSW)
├── hooks/                   # hooks reutilizables de datos y UI
├── types/                   # tipos de dominio
├── utils/
│   ├── format.ts            # moneda/fechas es-MX
│   └── tax.ts               # cálculo ISR (testeable)
├── views/
│   ├── Dashboard.tsx
│   ├── Movimientos.tsx
│   ├── Deducciones.tsx
│   └── Impuestos.tsx
├── App.tsx                  # router + providers
└── main.tsx
```

## 5. Priorización sugerida (orden de ejecución)

1. Fase 0 (higiene) — bajo esfuerzo, alto valor inmediato.
2. Fase 1 + 2 en paralelo — sin esto no hay app "de verdad".
3. Fase 3 — es el corazón del producto.
4. Fase 4 — eleva la percepción de calidad.
5. Fase 5 — cuanto antes se automatice, mejor; puede empezar en paralelo con la 2.
6. Fase 6 y 7 — al acercarse a un despliegue o integración con SAT real.

## 6. Riesgos y pendientes transversales

- **Sin backend real**: la Fase 2 (opción B + MSW) desbloquea todo el resto sin
  esperar al backend.
- **Reglas fiscales cambiantes**: el cálculo ISR debe parametrizarse (tablas por
  año) y versionarse; no hardcodear números en el componente.
- **Alcance académico**: es preferible entregar Fases 0–4 sólidas que intentar todo
  y dejar código a medias.