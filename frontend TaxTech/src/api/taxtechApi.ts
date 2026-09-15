import type {
  Movimiento,
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

export async function sincronizarCFDI(): Promise<ResultadoSincronizacion> {
  return peticion<ResultadoSincronizacion>('/cfdi/sincronizar', {
    method: 'POST',
    reintentos: 0,
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