import type {
  Movimiento,
  ResumenFinanciero,
} from '../types'

export const resumenFinanciero: ResumenFinanciero = {
  ingresos: 28450,
  gastos: 9820,
  deducibles: 6430,
  impuestoEstimado: 3240,
  reservaFiscal: 3500,
}

export const movimientos: Movimiento[] = [
  {
    id: '7f2c9a1e-3d4b-4f8e-9a1b-2c3d4e5f6a7b',
    concepto: 'Ingreso Uber',
    tipo: 'Ingreso',
    monto: 850,
    fecha: '2026-09-10',
    categoria: 'Plataformas digitales',
    deducible: false,
  },
  {
    id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
    concepto: 'Gasolina',
    tipo: 'Gasto',
    monto: 720,
    fecha: '2026-09-08',
    categoria: 'Transporte',
    deducible: true,
  },
  {
    id: '1e2f3a4b-5c6d-4e7f-8a9b-0c1d2e3f4a5b',
    concepto: 'Servicio de diseño',
    tipo: 'Ingreso',
    monto: 4500,
    fecha: '2026-09-05',
    categoria: 'Honorarios',
    deducible: false,
  },
  {
    id: '5a6b7c8d-9e0f-4a1b-2c3d-4e5f6a7b8c9d',
    concepto: 'Internet',
    tipo: 'Gasto',
    monto: 599,
    fecha: '2026-09-03',
    categoria: 'Servicios',
    deducible: true,
  },
]