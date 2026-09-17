import { useMemo } from 'react'
import { formatearMoneda } from '../utils/format'
import type { Movimiento } from '../types'

interface MesData {
  clave: string
  etiqueta: string
  ingresos: number
  gastos: number
}

interface PropsGrafico {
  movimientos: Movimiento[]
}

const ALTURA_BARRA = 160

function GraficoIngresosGastos({ movimientos }: PropsGrafico) {
  const meses = useMemo(() => agruparPorMes(movimientos), [movimientos])

  if (meses.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-400">
        Aún no hay movimientos para graficar.
      </p>
    )
  }

  const maximo = Math.max(
    ...meses.flatMap((mes) => [mes.ingresos, mes.gastos]),
    1,
  )

  return (
    <div>
      <div className="flex items-end gap-4 overflow-x-auto pb-1">
        {meses.map((mes) => (
          <div
            key={mes.clave}
            className="flex min-w-16 flex-1 flex-col items-center gap-2"
          >
            <div className="flex h-40 items-end justify-center gap-1.5">
              <Barra
                valor={mes.ingresos}
                maximo={maximo}
                color="bg-emerald-500"
                etiqueta={`Ingresos ${formatearMoneda(mes.ingresos)}`}
              />
              <Barra
                valor={mes.gastos}
                maximo={maximo}
                color="bg-red-400"
                etiqueta={`Gastos ${formatearMoneda(mes.gastos)}`}
              />
            </div>

            <span className="text-center text-xs font-medium text-slate-500">
              {mes.etiqueta}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-center gap-6 text-sm text-slate-600">
        <Leyenda color="bg-emerald-500" etiqueta="Ingresos" />
        <Leyenda color="bg-red-400" etiqueta="Gastos" />
      </div>
    </div>
  )
}

interface PropsBarra {
  valor: number
  maximo: number
  color: string
  etiqueta: string
}

function Barra({ valor, maximo, color, etiqueta }: PropsBarra) {
  const altura = valor > 0 ? Math.max(4, (valor / maximo) * ALTURA_BARRA) : 0

  return (
    <div
      title={etiqueta}
      className={`w-4 rounded-t-md ${color} transition-all sm:w-5`}
      style={{ height: altura }}
    />
  )
}

function Leyenda({ color, etiqueta }: { color: string; etiqueta: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className={`h-3 w-3 rounded ${color}`} />
      {etiqueta}
    </span>
  )
}

function agruparPorMes(movimientos: Movimiento[]): MesData[] {
  const porMes = new Map<string, MesData>()

  for (const movimiento of movimientos) {
    const clave = movimiento.fecha.slice(0, 7)
    const actual = porMes.get(clave) ?? {
      clave,
      etiqueta: etiquetaDeMes(clave),
      ingresos: 0,
      gastos: 0,
    }

    if (movimiento.tipo === 'Ingreso') {
      actual.ingresos += movimiento.monto
    } else {
      actual.gastos += movimiento.monto
    }

    porMes.set(clave, actual)
  }

  return Array.from(porMes.values()).sort((a, b) =>
    a.clave.localeCompare(b.clave),
  )
}

function etiquetaDeMes(clave: string): string {
  const [anio, numeroMes] = clave.split('-')
  const texto = new Intl.DateTimeFormat('es-MX', { month: 'short' }).format(
    new Date(Number(anio), Number(numeroMes) - 1, 1),
  )

  const capitalizado = texto.charAt(0).toUpperCase() + texto.slice(1)
  return `${capitalizado} ${anio.slice(2)}`
}

export default GraficoIngresosGastos