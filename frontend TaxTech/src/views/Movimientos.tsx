import EstadoError from '../components/feedback/EstadoError'
import EstadoVacio from '../components/feedback/EstadoVacio'
import { mensajeDeError } from '../api/client'
import { formatearFecha, formatearMoneda } from '../utils/format'
import { useMovimientos } from '../hooks/useFinanzas'
import { IconoIngresos } from '../components/icons'

function Movimientos() {
  const movimientos = useMovimientos()

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-600">
          Panel financiero
        </p>

        <h1 className="mt-1 bg-gradient-to-r from-violet-700 via-fuchsia-600 to-amber-500 bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-4xl">
          Movimientos
        </h1>

        <p className="mt-1 text-sm text-slate-600">
          Historial reciente de ingresos y gastos registrados.
        </p>
      </header>

      <section aria-label="Lista de movimientos" className="card mt-6 sm:mt-8">
        <div className="space-y-4">
          {movimientos.isLoading && (
            <div
              role="status"
              aria-busy="true"
              aria-label="Cargando movimientos..."
              className="space-y-4"
            >
              <span className="sr-only">Cargando movimientos...</span>
              {[0, 1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4 last:border-b-0"
                >
                  <div className="flex-1 space-y-2">
                    <div className="h-4.5 w-3/5 animate-pulse rounded-lg bg-slate-200/80" />
                    <div className="h-3.5 w-2/5 animate-pulse rounded-md bg-slate-100" />
                  </div>
                  <div className="h-5 w-24 animate-pulse rounded-lg bg-slate-200/80" />
                </div>
              ))}
            </div>
          )}

          {movimientos.isError && (
            <EstadoError
              mensaje={mensajeDeError(movimientos.error)}
              onReintentar={() => void movimientos.refetch()}
            />
          )}

          {!movimientos.isLoading &&
            !movimientos.isError &&
            (movimientos.data?.length === 0 ? (
              <EstadoVacio
                icono={<IconoIngresos className="h-6 w-6" />}
                mensaje="Sin movimientos todavía"
                detalle="Los ingresos y gastos que registres aparecerán aquí."
              />
            ) : (
              movimientos.data?.map((movimiento) => (
                <article
                  key={movimiento.id}
                  className="flex items-center justify-between gap-3 border-b border-slate-100 py-3.5 first:pt-0 last:border-b-0"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900 text-sm sm:text-base">
                        {movimiento.concepto}
                      </p>
                      {movimiento.deducible && (
                        <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-600/20">
                          Deducible
                        </span>
                      )}
                    </div>

                    <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                      <span className="font-medium text-slate-600">{movimiento.tipo}</span> ·{' '}
                      {movimiento.categoria} · {formatearFecha(movimiento.fecha)}
                    </p>
                  </div>

                  <p
                    className={`shrink-0 text-sm sm:text-base font-bold ${
                      movimiento.tipo === 'Ingreso'
                        ? 'text-emerald-600'
                        : 'text-red-500'
                    }`}
                  >
                    {movimiento.tipo === 'Ingreso' ? '+' : '-'}
                    {formatearMoneda(movimiento.monto)}
                  </p>
                </article>
              ))
            ))}
        </div>
      </section>
    </div>
  )
}

export default Movimientos