import { prisma } from '../db'
import type { Movimiento, TipoMovimiento } from '../types'

interface MovimientoEntrada {
  concepto: string
  tipo: TipoMovimiento
  monto: number
  fecha: string
  categoria: string
  deducible?: boolean
}

export type ActualizacionMovimiento = Partial<MovimientoEntrada>

function mapearMovimiento(fila: {
  id: string
  concepto: string
  tipo: string
  monto: number
  fecha: Date
  categoria: string
  deducible: boolean
}): Movimiento {
  return {
    id: fila.id,
    concepto: fila.concepto,
    tipo: fila.tipo as TipoMovimiento,
    monto: fila.monto,
    fecha: fila.fecha.toISOString(),
    categoria: fila.categoria,
    deducible: fila.deducible,
  }
}

export async function listarMovimientos(): Promise<Movimiento[]> {
  const filas = await prisma.movimiento.findMany({
    orderBy: { fecha: 'desc' },
  })

  return filas.map(mapearMovimiento)
}

export async function crearMovimiento(
  datos: MovimientoEntrada,
): Promise<Movimiento> {
  const fila = await prisma.movimiento.create({
    data: {
      concepto: datos.concepto,
      tipo: datos.tipo,
      monto: datos.monto,
      fecha: new Date(datos.fecha),
      categoria: datos.categoria,
      deducible: datos.deducible ?? false,
    },
  })

  return mapearMovimiento(fila)
}

export async function actualizarMovimiento(
  id: string,
  datos: ActualizacionMovimiento,
): Promise<Movimiento | null> {
  const existe = await prisma.movimiento.findUnique({ where: { id } })
  if (!existe) return null

  const fila = await prisma.movimiento.update({
    where: { id },
    data: {
      ...(datos.concepto !== undefined && { concepto: datos.concepto }),
      ...(datos.tipo !== undefined && { tipo: datos.tipo }),
      ...(datos.monto !== undefined && { monto: datos.monto }),
      ...(datos.fecha !== undefined && { fecha: new Date(datos.fecha) }),
      ...(datos.categoria !== undefined && { categoria: datos.categoria }),
      ...(datos.deducible !== undefined && { deducible: datos.deducible }),
    },
  })

  return mapearMovimiento(fila)
}

export async function eliminarMovimiento(id: string): Promise<boolean> {
  const existe = await prisma.movimiento.findUnique({ where: { id } })
  if (!existe) return false

  await prisma.movimiento.delete({ where: { id } })
  return true
}