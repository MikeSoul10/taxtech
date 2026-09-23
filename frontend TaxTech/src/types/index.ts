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

export interface ComprobanteCFDI {
  uuid: string
  rfcEmisor: string
  nombreEmisor: string
  rfcReceptor: string
  nombreReceptor: string
  concepto: string
  tipo: TipoMovimiento
  subtotal: number
  iva: number
  total: number
  fecha: string
  categoria: string
  deducible: boolean
  estado: 'Vigente' | 'Cancelado'
}

export interface SolicitudImportacionCFDI {
  comprobantes: ComprobanteCFDI[]
}

export interface ResultadoImportacionCFDI {
  ok: boolean
  importados: number
  mensaje: string
  movimientos: Movimiento[]
}

export interface ResultadoReserva {
  ok: boolean
  cantidadReservada: number
}