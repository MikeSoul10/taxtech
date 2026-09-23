# TaxTech — Diagramas de flujo

Diagramas en sintaxis [Mermaid](https://mermaid.js.org) (se renderizan en VSCode, GitHub, Obsidian, etc.).

## 1. Arquitectura general

```mermaid
flowchart LR
    subgraph Navegador
        U[Usuario]
        V[Vistas React<br/>Dashboard / Movimientos / Deducciones / Impuestos]
    end

    subgraph Frontend[Frontend :5173]
        H[Hooks useFinanzas<br/>TanStack Query]
        A[src/api/taxtechApi.ts]
        C[src/api/client.ts<br/>fetch + timeout 10s]
    end

    subgraph Backend[Backend Express :4000]
        RT[Router /api/*]
        SV[Servicios<br/>resumen / movimientos / impuestos / tax]
        VZ[Validación zod]
        EH[errorHandler<br/>400 zod / 500]
    end

    subgraph BD[Base de datos]
        PR[Prisma ORM]
        SQL[(SQLite<br/>dev.db)]
    end

    U --> V
    V --> H
    H --> A
    A -->|GET/POST/PATCH/DELETE| C
    C -- "CORS (solo :5173)" --> RT
    RT --> VZ
    VZ --> SV
    SV --> PR
    PR --> SQL
    SQL --> PR --> SV --> RT --> C --> H --> V --> U

    RT -->|errores| EH
    EH -->|JSON error| C
```

## 2. Flujo de datos del Dashboard

```mermaid
sequenceDiagram
    participant U as Usuario
    participant D as Dashboard.tsx
    participant H as useResumenFinanciero<br/>useMovimientos
    participant B as Backend /api
    participant S as resumenService + taxService
    participant DB as SQLite (Prisma)

    U->>D: Abre "/"
    D->>H: useQuery(['resumen'])
    H->>B: GET /api/resumen
    B->>S: obtenerResumen()
    S->>DB: findMany(Movimiento) + aggregate(ReservaFiscal)
    DB-->>S: filas
    S->>S: suma ingresos/gastos/deducibles<br/>estimarImpuesto (tarifa ISR 2026)
    S-->>B: { ingresos, gastos, deducibles,<br/>impuestoEstimado, reservaFiscal }
    B-->>H: JSON
    H-->>D: datos en caché (staleTime 60s)
    D-->>U: tarjetas + gráfica mensual + reserva
```

## 3. CRUD de movimientos

```mermaid
flowchart TD
    A[Usuario en /movimientos] --> B{Pulsó botón?}

    B -->|"+ Nuevo"| C[Abre Modal + FormularioMovimiento]
    B -->|"Editar"| D[Modal precargado]
    B -->|"Eliminar"| E[window.confirm]

    C --> F[Valida campos zod]
    D --> F
    F --> G{¿Nuevo o edición?}
    G -->|Nuevo| H[POST /api/movimientos]
    G -->|Edición| I[PATCH /api/movimientos/:id]
    E --> J[DELETE /api/movimientos/:id]

    H --> K[ErrorHandler]
    I --> K
    J --> K
    K -->|400 o 500| L[Aviso de error]
    K -->|201 / 200 / 204| M[Aviso de éxito]

    M --> N[Invalidar caché<br/>['movimientos'] y ['resumen']]
    N --> O[Todas las vistas se refrescan]
    L --> O
```

## 4. Deducciones (switch deducible)

```mermaid
flowchart LR
    U[Usuario alterna switch] --> P[PATCH /movimientos/:id<br/>body: { deducible: !deducible }]
    P --> R{Respuesta}
    R -->|200| I[Invalidar caché]
    R -->|error| E[Aviso error]
    I --> X[Dashboard e Impuestos<br/>recalculan ISR]
```

## 5. Impuestos y reserva fiscal

```mermaid
flowchart TD
    U[Usuario en /impuestos] --> P[Elige % 10-30 o monto]
    P --> M[input 0-100]
    M --> A[monto = ingresos x % / 100]
    A --> R[POST /api/impuestos/reservar<br/>body: { cantidad }]
    R --> R2{Respuesta}
    R2 -->|201| I[Invalidar caché<br/>resumen]
    R2 -->|400| E[Aviso error]
    I --> N[Barra de progreso de reserva<br/>se actualiza]

    subgraph Desglose[Desglose calculado en cliente con utils/tax.ts]
        D1[Ingresos] --> D2[Tope deducciones 10%]
        D2 --> D3[Base gravable]
        D3 --> D4[Tramo LISR 2026]
        D4 --> D5[ISR estimado]
    end
```

## 6. Sincronización CFDI (simulación)

```mermaid
flowchart TD
    U[Botón Sincronizar CFDI<br/>en Dashboard] --> S[POST /api/cfdi/sincronizar]
    S --> T{Backend}
    T -->|Respuesta fija| R["{ comprobantesEncontrados: 24 }<br/>— NO toca la BD —"]
    T -->|Error| E[Toast error]
    R --> O[Toast éxito: 24 comprobantes<br/>encontrados]
```

## 7. Manejo de errores

```mermaid
flowchart LR
    E[Cualquier error async<br/>Express 5 auto-propagación] --> H{errorHandler}
    H -->|"instanceof ZodError"| Z["400<br/>{ ok: false, mensaje: 'Datos inválidos',<br/>errores: [{ campo, mensaje }] }"]
    H -->|Otro error| I["500<br/>{ ok: false, mensaje: 'Error interno del servidor' }"]
```