export type TipoMovimiento = 'Ingreso' | 'Gasto'

export interface Movimiento {
  id: string
  concepto: string
  tipo: TipoMovimiento
  monto: number
  fecha: string
  categoria: string
  deducible: boolean
}

export interface ResumenFinanciero {
  ingresos: number
  gastos: number
  deducibles: number
  impuestoEstimado: number
  reservaFiscal: number
}

export interface ResultadoSincronizacion {
  comprobantesEncontrados: number
  mensaje: string
}

export interface ResultadoReserva {
  ok: boolean
  cantidadReservada: number
}