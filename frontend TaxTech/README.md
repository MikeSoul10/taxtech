# TaxTech

TaxTech es un prototipo de plataforma financiera y fiscal orientada a trabajadores independientes, freelancers y personas que generan ingresos mediante plataformas digitales.

El proyecto busca centralizar información financiera, visualizar ingresos y gastos, identificar posibles deducciones y mostrar una estimación de obligaciones fiscales.

Actualmente el proyecto funciona como un **MVP frontend** desarrollado con React, TypeScript y Tailwind CSS. Algunas funciones, como la sincronización de CFDI, utilizan datos simulados y están preparadas para conectarse posteriormente a una API.

## Tecnologías

- React
- TypeScript
- Vite
- Tailwind CSS
- Node.js / npm

## Requisitos

Antes de instalar el proyecto es necesario tener:

- Node.js
- npm
- Git

Para comprobar que están instalados:

```bash
node --version
npm --version
git --version
```

## Instalación

### 1. Clonar el repositorio

```bash
git clone URL_DEL_REPOSITORIO
```

### 2. Entrar al proyecto

```bash
cd taxtech
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Vite mostrará una dirección local similar a:

```text
http://localhost:5173/
```

Abrir esa dirección en el navegador.

## Funcionalidades actuales

El MVP incluye:

- Dashboard financiero.
- Visualización de ingresos y gastos.
- Sección de movimientos.
- Identificación de gastos potencialmente deducibles.
- Estimación de impuestos.
- Visualización de reserva fiscal.
- Navegación entre las diferentes secciones.
- Simulación de sincronización de CFDI.

## Datos simulados

Actualmente el proyecto utiliza datos de prueba almacenados localmente.

La capa:

```text
src/api/taxtechApi.ts
```

está preparada para sustituir progresivamente estos datos por peticiones a una API real.

Por ejemplo:

```text
Frontend React
      ↓
taxtechApi.ts
      ↓
API / Backend
      ↓
Base de datos y servicios externos
```

La sincronización de CFDI disponible actualmente es una simulación y **no realiza conexiones reales con el SAT**.

## Estructura principal

```text
src/
├── api/
│   └── taxtechApi.ts
├── components/
│   ├── Sidebar.tsx
│   └── StatCard.tsx
├── data/
│   └── mockData.ts
├── views/
│   ├── Dashboard.tsx
│   ├── Movimientos.tsx
│   ├── Deducciones.tsx
│   └── Impuestos.tsx
├── App.tsx
├── main.tsx
└── index.css
```

## Build de producción

Para generar una versión compilada:

```bash
npm run build
```

Para probar localmente el build generado:

```bash
npm run preview
```

## Estado del proyecto

TaxTech se encuentra actualmente en fase de prototipo/MVP académico.

El proyecto continuará evolucionando con nuevas funcionalidades y la futura integración de servicios backend y APIs.
