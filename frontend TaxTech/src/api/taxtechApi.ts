import type {
  ComprobanteCFDI,
  Movimiento,
  ResultadoImportacionCFDI,
  ResultadoReserva,
  ResultadoSincronizacion,
  ResumenFinanciero,
} from '../types'
import { peticion } from './client'

export async function obtenerResumenFinanciero(): Promise<ResumenFinanciero> {
  return peticion<ResumenFinanciero>('/resumen')
}

export async function obtenerMovimientos(): Promise<Movimiento[]> {
  return peticion<Movimiento[]>('/movimientos')
}

export async function crearMovimiento(
  datos: Omit<Movimiento, 'id'>,
): Promise<Movimiento> {
  return peticion<Movimiento>('/movimientos', {
    method: 'POST',
    reintentos: 0,
    body: JSON.stringify(datos),
  })
}

export async function actualizarMovimiento(
  id: string,
  datos: Partial<Omit<Movimiento, 'id'>>,
): Promise<Movimiento> {
  return peticion<Movimiento>(`/movimientos/${id}`, {
    method: 'PATCH',
    reintentos: 0,
    body: JSON.stringify(datos),
  })
}

export async function eliminarMovimiento(id: string): Promise<void> {
  await peticion<void>(`/movimientos/${id}`, {
    method: 'DELETE',
    reintentos: 0,
  })
}

export async function eliminarMovimientosMasivo(
  tipo?: 'todos' | 'Ingreso' | 'Gasto',
): Promise<{ ok: boolean; cantidadEliminados: number }> {
  const query = tipo ? `?tipo=${tipo}` : ''
  return peticion<{ ok: boolean; cantidadEliminados: number }>(`/movimientos${query}`, {
    method: 'DELETE',
    reintentos: 0,
  })
}

export async function sincronizarCFDI(): Promise<ResultadoSincronizacion> {
  return peticion<ResultadoSincronizacion>('/cfdi/sincronizar', {
    method: 'POST',
    reintentos: 0,
  })
}

export async function consultarCFDISat(params: {
  tipo?: string
  rfc?: string
}): Promise<{ ok: boolean; totalEncontrados: number; comprobantes: ComprobanteCFDI[] }> {
  return peticion<{ ok: boolean; totalEncontrados: number; comprobantes: ComprobanteCFDI[] }>(
    '/cfdi/consultar',
    {
      method: 'POST',
      reintentos: 0,
      body: JSON.stringify(params),
    },
  )
}

export async function importarCFDISat(
  comprobantes: ComprobanteCFDI[],
): Promise<ResultadoImportacionCFDI> {
  return peticion<ResultadoImportacionCFDI>('/cfdi/importar', {
    method: 'POST',
    reintentos: 0,
    body: JSON.stringify({ comprobantes }),
  })
}

export async function reservarImpuestos(
  cantidad: number,
): Promise<ResultadoReserva> {
  return peticion<ResultadoReserva>('/impuestos/reservar', {
    method: 'POST',
    reintentos: 0,
    body: JSON.stringify({ cantidad }),
  })
}

export async function reiniciarReservaImpuestos(): Promise<ResultadoReserva> {
  return peticion<ResultadoReserva>('/impuestos/reiniciar', {
    method: 'POST',
    reintentos: 0,
  })
}