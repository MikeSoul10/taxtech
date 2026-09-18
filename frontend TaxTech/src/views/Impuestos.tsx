import EstadoError from '../components/feedback/EstadoError'
import { mensajeDeError } from '../api/client'
import { formatearMoneda } from '../utils/format'
import { useResumenFinanciero } from '../hooks/useFinanzas'
import { IconoImpuesto, IconoBanca } from '../components/icons'

function Impuestos() {
  const resumen = useResumenFinanciero()
  const datos = resumen.data

  const cobertura =
    datos && datos.impuestoEstimado > 0
      ? Math.min(100, Math.round((datos.reservaFiscal / datos.impuestoEstimado) * 100))
      : 0

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
          Estimación fiscal y estado de tu fondo de reserva para el periodo actual.
        </p>
      </header>

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

                <p className="mt-2 text-xs sm:text-sm text-slate-500">
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
              </article>
            </>
          )}
      </section>
    </div>
  )
}

export default Impuestos