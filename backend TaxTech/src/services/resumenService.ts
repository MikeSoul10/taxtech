import { prisma } from '../db'
import { estimarImpuesto } from './taxService'
import type { ResumenFinanciero } from '../types'

export async function obtenerResumen(): Promise<ResumenFinanciero> {
  const movimientos = await prisma.movimiento.findMany()

  const ingresos = movimientos
    .filter((movimiento) => movimiento.tipo === 'Ingreso')
    .reduce((acumulado, movimiento) => acumulado + movimiento.monto, 0)

  const gastos = movimientos
    .filter((movimiento) => movimiento.tipo === 'Gasto')
    .reduce((acumulado, movimiento) => acumulado + movimiento.monto, 0)

  const deducibles = movimientos
    .filter((movimiento) => movimiento.tipo === 'Gasto' && movimiento.deducible)
    .reduce((acumulado, movimiento) => acumulado + movimiento.monto, 0)

  const reservas = await prisma.reservaFiscal.aggregate({
    _sum: { cantidad: true },
  })

  return {
    ingresos: Math.round(ingresos * 100) / 100,
    gastos: Math.round(gastos * 100) / 100,
    deducibles: Math.round(deducibles * 100) / 100,
    impuestoEstimado: estimarImpuesto(ingresos, deducibles),
    reservaFiscal: reservas._sum.cantidad ?? 0,
  }
}