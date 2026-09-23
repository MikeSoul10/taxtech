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
  useReiniciarReservaImpuestos,
  useReservarImpuestos,
  useResumenFinanciero,
} from '../hooks/useFinanzas'
import { IconoImpuesto, IconoBanca } from '../components/icons'

const porcentajesRapidos = [10, 15, 20, 25, 30]

function redondearCentavos(valor: number): number {
  return Math.round(valor * 100) / 100
}

function Impuestos() {
  const resumen = useResumenFinanciero()
  const reservar = useReservarImpuestos()
  const reiniciarReserva = useReiniciarReservaImpuestos()
  const datos = resumen.data

  const [porcentaje, setPorcentaje] = useState(20)
  const [aviso, setAviso] = useState<{ tono: 'exito' | 'error'; mensaje: string } | null>(
    null,
  )

  async function manejarReiniciarReserva() {
    const confirmado = window.confirm(
      '¿Estás seguro de que deseas reiniciar tu reserva fiscal a $0.00? Esta acción borrará el acumulado apartado.',
    )
    if (!confirmado) return

    setAviso(null)
    try {
      await reiniciarReserva.mutateAsync()
      setAviso({ tono: 'exito', mensaje: 'Reserva fiscal reiniciada a $0.00.' })
    } catch (error) {
      setAviso({ tono: 'error', mensaje: mensajeDeError(error) })
    }
  }

  const cobertura =
    datos && datos.impuestoEstimado > 0
      ? Math.min(100, Math.round((datos.reservaFiscal / datos.impuestoEstimado) * 100))
      : 0

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
    <div className="p-4 sm:p-6 lg:p-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-600">
          Panel financiero
        </p>

        <h1 className="mt-1 bg-gradient-to-r from-violet-700 via-fuchsia-600 to-amber-500 bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-4xl">
          Impuestos
        </h1>

        <p className="mt-1 text-sm text-slate-600">
          Estimación de ISR (LISR 2026) y reserva fiscal configurable.
        </p>
      </header>

      {aviso && (
        <div className="mt-6">
          <Aviso tono={aviso.tono} mensaje={aviso.mensaje} />
        </div>
      )}

      <section aria-label="Tarjetas de cálculo fiscal" className="mt-6 sm:mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
        {resumen.isLoading && (
          <div
            role="status"
            aria-busy="true"
            aria-label="Cargando información fiscal..."
            className="col-span-full grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6"
          >
            <span className="sr-only">Cargando estimaciones fiscales...</span>
            <div className="card h-40 animate-pulse bg-slate-200/80" />
            <div className="card h-40 animate-pulse bg-slate-200/80" />
          </div>
        )}

        {resumen.isError && (
          <div className="col-span-full">
            <EstadoError
              mensaje={mensajeDeError(resumen.error)}
              onReintentar={() => void resumen.refetch()}
            />
          </div>
        )}

        {!resumen.isLoading &&
          !resumen.isError &&
          datos && (
            <>
              <article className="card relative overflow-hidden">
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-1.5 bg-amber-500"
                />
                <div className="flex items-start justify-between">
                  <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-600">
                    Impuesto estimado
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                    <IconoImpuesto className="h-5 w-5" />
                  </div>
                </div>

                <p className="mt-3 text-3xl sm:text-4xl font-black text-rose-600">
                  {formatearMoneda(datos.impuestoEstimado)}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Calculado con la tarifa anual de la LISR 2026
                </p>

                <p className="mt-1 text-xs sm:text-sm text-slate-500">
                  Cálculo preliminar basado en los ingresos facturados del mes.
                </p>
              </article>

              <article className="card relative overflow-hidden">
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-1.5 bg-violet-600"
                />
                <div className="flex items-start justify-between">
                  <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-600">
                    Reserva fiscal actual
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                    <IconoBanca className="h-5 w-5" />
                  </div>
                </div>

                <p className="mt-3 text-3xl sm:text-4xl font-black text-slate-900">
                  {formatearMoneda(datos.reservaFiscal)}
                </p>

                <div className="mt-2 flex items-center justify-between text-xs sm:text-sm text-slate-500">
                  <span>Cobertura de impuesto estimado:</span>
                  <span className="font-bold text-violet-700">{cobertura}%</span>
                </div>

                <div
                  role="progressbar"
                  aria-valuenow={cobertura}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Porcentaje de ahorro cubierto para impuestos"
                  className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100"
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${cobertura}%` }}
                  />
                </div>

                <div className="mt-4 border-t border-slate-100 pt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => void manejarReiniciarReserva()}
                    disabled={reiniciarReserva.isPending || !datos?.reservaFiscal}
                    className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                  >
                    🔄 Reiniciar reserva a $0
                  </button>
                </div>
              </article>
            </>
          )}
      </section>

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

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void manejarReiniciarReserva()}
                  disabled={reiniciarReserva.isPending || !datos?.reservaFiscal}
                  className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-800 transition hover:bg-rose-100 disabled:opacity-50"
                >
                  🔄 Reiniciar reserva
                </button>

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