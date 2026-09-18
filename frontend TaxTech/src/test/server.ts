import { http, HttpResponse } from 'msw'
import { estimarImpuesto } from '../utils/tax'
import type { Movimiento, ResumenFinanciero } from '../types'

export const movimientosIniciales: Movimiento[] = [
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

let movimientos: Movimiento[] = []
let reservaFiscal = 0
let contadorId = 0

function generarId(): string {
  contadorId += 1
  return `mock-${contadorId}-${Date.now().toString(36)}`
}

export function reiniciarDatos(
  datos?: { movimientos?: Movimiento[]; reservaFiscal?: number },
) {
  movimientos = datos?.movimientos ?? movimientosIniciales.map(clonar)
  reservaFiscal = datos?.reservaFiscal ?? 3500
}

function clonar(movimiento: Movimiento): Movimiento {
  return { ...movimiento }
}

function calcularResumen(): ResumenFinanciero {
  const redondear = (valor: number) => Math.round(valor * 100) / 100

  const ingresos = redondear(
    movimientos
      .filter((m) => m.tipo === 'Ingreso')
      .reduce((total, m) => total + m.monto, 0),
  )

  const gastos = redondear(
    movimientos
      .filter((m) => m.tipo === 'Gasto')
      .reduce((total, m) => total + m.monto, 0),
  )

  const deducibles = redondear(
    movimientos
      .filter((m) => m.tipo === 'Gasto' && m.deducible)
      .reduce((total, m) => total + m.monto, 0),
  )

  return {
    ingresos,
    gastos,
    deducibles,
    impuestoEstimado: estimarImpuesto(ingresos, deducibles),
    reservaFiscal: redondear(reservaFiscal),
  }
}

const respuestaNoEncontrado = () =>
  HttpResponse.json(
    { ok: false, mensaje: 'Movimiento no encontrado' },
    { status: 404 },
  )

export const handlers = [
  http.get('*/api/resumen', () => HttpResponse.json(calcularResumen())),

  http.get('*/api/movimientos', () =>
    HttpResponse.json(movimientos.map(clonar)),
  ),

  http.post('*/api/movimientos', async ({ request }) => {
    const cuerpo = (await request.json()) as Partial<Movimiento>
    const nuevo: Movimiento = {
      id: generarId(),
      concepto: String(cuerpo.concepto ?? ''),
      tipo: cuerpo.tipo === 'Ingreso' ? 'Ingreso' : 'Gasto',
      monto: Number(cuerpo.monto ?? 0),
      fecha: String(cuerpo.fecha ?? ''),
      categoria: String(cuerpo.categoria ?? ''),
      deducible: Boolean(cuerpo.deducible),
    }

    movimientos = [...movimientos, nuevo]
    return HttpResponse.json(nuevo, { status: 201 })
  }),

  http.patch('*/api/movimientos/:id', async ({ params, request }) => {
    const movimiento = movimientos.find((m) => m.id === params.id)
    if (!movimiento) return respuestaNoEncontrado()

    const cuerpo = (await request.json()) as Partial<Movimiento>
    const actualizado: Movimiento = {
      ...movimiento,
      ...cuerpo,
      monto:
        cuerpo.monto !== undefined ? Number(cuerpo.monto) : movimiento.monto,
      deducible:
        cuerpo.deducible !== undefined
          ? Boolean(cuerpo.deducible)
          : movimiento.deducible,
    }

    movimientos = movimientos.map((m) =>
      m.id === params.id ? actualizado : m,
    )
    return HttpResponse.json(actualizado)
  }),

  http.delete('*/api/movimientos/:id', ({ params }) => {
    const existe = movimientos.some((m) => m.id === params.id)
    if (!existe) return respuestaNoEncontrado()

    movimientos = movimientos.filter((m) => m.id !== params.id)
    return new HttpResponse(null, { status: 204 })
  }),

  http.post('*/api/impuestos/reservar', async ({ request }) => {
    const cuerpo = (await request.json()) as { cantidad?: number }
    const cantidad = Number(cuerpo.cantidad ?? 0)

    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      return HttpResponse.json(
        { ok: false, mensaje: 'Cantidad inválida' },
        { status: 400 },
      )
    }

    reservaFiscal = reservaFiscal + cantidad
    return HttpResponse.json(
      { ok: true, cantidadReservada: cantidad },
      { status: 201 },
    )
  }),

  http.post('*/api/cfdi/sincronizar', () =>
    HttpResponse.json({
      comprobantesEncontrados: 24,
      mensaje: 'Sincronización completada (simulación)',
    }),
  ),
]