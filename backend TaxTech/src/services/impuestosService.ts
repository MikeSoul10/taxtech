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

export async function reiniciarReservaFiscal(): Promise<ResultadoReserva> {
  await prisma.reservaFiscal.deleteMany({})
  return {
    ok: true,
    cantidadReservada: 0,
  }
}