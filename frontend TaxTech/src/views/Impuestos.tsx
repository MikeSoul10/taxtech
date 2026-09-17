import { useMemo, useState } from 'react'
import EstadoError from '../components/feedback/EstadoError'
import Aviso from '../components/feedback/Aviso'
import { mensajeDeError } from '../api/client'
import { formatearMoneda } from '../utils/format'
import {
  calcularBaseGravable,
  calcularISR,
  obtenerTramo,
  topeDeducciones,
} from '../utils/tax'
import {
  useReservarImpuestos,
  useResumenFinanciero,
} from '../hooks/useFinanzas'

const porcentajesRapidos = [10, 15, 20, 25, 30]

function redondearCentavos(valor: number): number {
  return Math.round(valor * 100) / 100
}

function Impuestos() {
  const resumen = useResumenFinanciero()
  const reservar = useReservarImpuestos()

  const [porcentaje, setPorcentaje] = useState(20)
  const [aviso, setAviso] = useState<{ tono: 'exito' | 'error'; mensaje: string } | null>(
    null,
  )

  const desglose = useMemo(() => {
    const ingresos = resumen.data?.ingresos ?? 0
    const deducibles = resumen.data?.deducibles ?? 0

    const tope = topeDeducciones(ingresos, deducibles)
    const base = calcularBaseGravable(ingresos, deducibles)
    const tramo = obtenerTramo(base)

    return {
      tope,
      base,
      impuesto: calcularISR(base),
      tramo,
    }
  }, [resumen.data])

  const cantidadReservar = useMemo(
    () => redondearCentavos((resumen.data?.ingresos ?? 0) * (porcentaje / 100)),
    [resumen.data, porcentaje],
  )

  async function manejarReservar() {
    if (cantidadReservar <= 0) {
      setAviso({ tono: 'error', mensaje: 'No hay ingresos suficientes para reservar.' })
      return
    }

    setAviso(null)

    try {
      const resultado = await reservar.mutateAsync(cantidadReservar)
      setAviso({
        tono: 'exito',
        mensaje: `Reserva registrada por ${formatearMoneda(resultado.cantidadReservada)}.`,
      })
    } catch (error) {
      setAviso({ tono: 'error', mensaje: mensajeDeError(error) })
    }
  }

  return (
    <div className="p-8">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-600">
        Panel financiero
      </p>

      <h2 className="mt-1 bg-gradient-to-r from-violet-700 via-fuchsia-600 to-amber-500 bg-clip-text text-3xl font-black tracking-tight text-transparent">
        Impuestos
      </h2>

      <p className="mt-1 text-slate-500">
        Estimación de ISR (LISR 2026) y reserva fiscal configurable.
      </p>

      {aviso && (
        <div className="mt-6">
          <Aviso tono={aviso.tono} mensaje={aviso.mensaje} />
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {resumen.isLoading && (
          <>
            <div className="card h-32 animate-pulse bg-slate-200" />
            <div className="card h-32 animate-pulse bg-slate-200" />
          </>
        )}

        {resumen.isError && (
          <div className="sm:col-span-2">
            <EstadoError
              mensaje={mensajeDeError(resumen.error)}
              onReintentar={() => void resumen.refetch()}
            />
          </div>
        )}

        {!resumen.isLoading &&
          !resumen.isError &&
          resumen.data && (
            <>
              <div className="card">
                <p className="text-sm text-slate-500">Impuesto estimado</p>

                <p className="mt-2 text-4xl font-bold text-red-500">
                  {formatearMoneda(resumen.data.impuestoEstimado)}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Calculado con la tarifa anual de la LISR 2026
                </p>
              </div>

              <div className="card">
                <p className="text-sm text-slate-500">Reserva fiscal actual</p>

                <p className="mt-2 text-4xl font-bold text-slate-900">
                  {formatearMoneda(resumen.data.reservaFiscal)}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Acumulado de reservas contra tus ingresos
                </p>
              </div>
            </>
          )}
      </div>

      {!resumen.isLoading &&
        !resumen.isError &&
        resumen.data && (
          <div className="card mt-6">
            <h3 className="text-lg font-bold text-slate-900">
              Desglose del cálculo
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FilaDesglose
                etiqueta="Ingresos"
                valor={formatearMoneda(resumen.data.ingresos)}
              />
              <FilaDesglose
                etiqueta="Deducciones aplicadas (tope 10%)"
                valor={formatearMoneda(desglose.tope)}
              />
              <FilaDesglose
                etiqueta="Base gravable"
                valor={formatearMoneda(desglose.base)}
              />
              <FilaDesglose
                etiqueta="Tramo / coeficiente"
                valor={
                  desglose.tramo
                    ? `Tramo con tasa ${desglose.tramo.excedentePorCiento}%`
                    : 'Sin tramo aplicable'
                }
              />
            </div>

            <div className="mt-4 border-t border-slate-100 pt-4">
              <FilaDesglose
                etiqueta="ISR estimado"
                valor={formatearMoneda(desglose.impuesto)}
                resaltado
              />
            </div>
          </div>
        )}

      {!resumen.isLoading &&
        !resumen.isError &&
        resumen.data && (
          <div className="card mt-6">
            <h3 className="text-lg font-bold text-slate-900">
              Reservar impuestos
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Reserva un porcentaje de tus ingresos contra el impuesto estimado.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {porcentajesRapidos.map((valor) => (
                <button
                  key={valor}
                  type="button"
                  onClick={() => setPorcentaje(valor)}
                  className={
                    porcentaje === valor
                      ? 'rounded-full bg-violet-600 px-4 py-1.5 text-sm font-semibold text-white transition'
                      : 'rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm font-medium text-slate-600 transition hover:border-violet-300'
                  }
                >
                  {valor}%
                </button>
              ))}

              <label className="ml-auto flex items-center gap-2 text-sm text-slate-600">
                Otro:
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={porcentaje}
                  onChange={(evento) =>
                    setPorcentaje(Math.max(0, Math.min(100, Number(evento.target.value))))
                  }
                  className="w-20 rounded-xl border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                  aria-label="Porcentaje a reservar"
                />
                %
              </label>
            </div>

            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600">
                Monto a reservar:{' '}
                <span className="font-bold text-slate-900">
                  {formatearMoneda(cantidadReservar)}
                </span>
              </p>

              <button
                type="button"
                onClick={() => void manejarReservar()}
                disabled={reservar.isPending || cantidadReservar <= 0}
                className="btn-primary"
              >
                {reservar.isPending
                  ? 'Reservando...'
                  : `Reservar ${porcentaje}% de ingresos`}
              </button>
            </div>
          </div>
        )}
    </div>
  )
}

interface PropsFilaDesglose {
  etiqueta: string
  valor: string
  resaltado?: boolean
}

function FilaDesglose({ etiqueta, valor, resaltado }: PropsFilaDesglose) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
      <span className="text-sm text-slate-500">{etiqueta}</span>
      <span
        className={
          resaltado
            ? 'font-bold text-red-500'
            : 'font-semibold text-slate-900'
        }
      >
        {valor}
      </span>
    </div>
  )
}

export default Impuestos