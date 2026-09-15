import { prisma } from '../db'
import type { ResultadoReserva } from '../types'

export async function reservarImpuestos(
  cantidad: number,
): Promise<ResultadoReserva> {
  const reserva = await prisma.reservaFiscal.create({
    data: { cantidad },
  })

  return {
    ok: true,
    cantidadReservada: reserva.cantidad,
  }
}