import { useState } from 'react'
import EstadoError from '../components/feedback/EstadoError'
import EstadoVacio from '../components/feedback/EstadoVacio'
import Aviso from '../components/feedback/Aviso'
import { mensajeDeError } from '../api/client'
import { formatearFecha, formatearMoneda } from '../utils/format'
import {
  useActualizarMovimiento,
  useMovimientos,
  useResumenFinanciero,
} from '../hooks/useFinanzas'
import { IconoDeducibles } from '../components/icons'

function Deducciones() {
  const movimientos = useMovimientos()
  const resumen = useResumenFinanciero()
  const actualizarMovimiento = useActualizarMovimiento()

  const [alternandoId, setAlternandoId] = useState<string | null>(null)
  const [aviso, setAviso] = useState<{ tono: 'exito' | 'error'; mensaje: string } | null>(
    null,
  )

  const cargando = movimientos.isLoading || resumen.isLoading
  const error = movimientos.isError || resumen.isError

  const gastos = movimientos.data?.filter(
    (movimiento) => movimiento.tipo === 'Gasto',
  )

  const deducibles = gastos?.filter((movimiento) => movimiento.deducible)

  async function alternarDeducible(id: string, deducible: boolean) {
    setAlternandoId(id)
    setAviso(null)

    try {
      await actualizarMovimiento.mutateAsync({
        id,
        datos: { deducible: !deducible },
      })
    } catch (e) {
      setAviso({ tono: 'error', mensaje: mensajeDeError(e) })
    } finally {
      setAlternandoId(null)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-600">
          Panel financiero
        </p>

        <h1 className="mt-1 bg-gradient-to-r from-violet-700 via-fuchsia-600 to-amber-500 bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-4xl">
          Deducciones
        </h1>

        <p className="mt-1 text-sm text-slate-600">
          Marca manualmente qué gastos son deducibles.
        </p>
      </header>

      {aviso && (
        <div className="mt-6">
          <Aviso tono={aviso.tono} mensaje={aviso.mensaje} />
        </div>
      )}

      <section aria-label="Resumen y lista de deducciones" className="card mt-6 sm:mt-8">
        <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-600">
          Total potencialmente deducible
        </p>

        {cargando ? (
          <div
            role="status"
            aria-busy="true"
            aria-label="Cargando total deducible..."
            className="mt-2 h-10 w-48 sm:w-64 animate-pulse rounded-lg bg-slate-200/80"
          >
            <span className="sr-only">Cargando total deducible...</span>
          </div>
        ) : (
          <p className="mt-2 text-3xl sm:text-4xl font-black text-emerald-600">
            {formatearMoneda(resumen.data?.deducibles ?? 0)}
          </p>
        )}

        {resumen.data && (
          <p className="mt-1 text-xs text-slate-400">
            {deducibles?.length ?? 0} de {gastos?.length ?? 0} gastos marcados
            como deducibles
          </p>
        )}

        <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
          {cargando && (
            <div
              role="status"
              aria-busy="true"
              aria-label="Cargando lista de gastos deducibles..."
              className="space-y-3"
            >
              <span className="sr-only">Cargando lista de deducciones...</span>
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-b-0"
                >
                  <div className="h-4 w-3/5 animate-pulse rounded bg-slate-200/80" />
                  <div className="h-4 w-20 animate-pulse rounded bg-slate-200/80" />
                </div>
              ))}
            </div>
          )}

          {error && (
            <EstadoError
              mensaje={
                movimientos.isError
                  ? mensajeDeError(movimientos.error)
                  : mensajeDeError(resumen.error)
              }
              onReintentar={() => {
                void movimientos.refetch()
                void resumen.refetch()
              }}
            />
          )}

          {!cargando &&
            !error &&
            (gastos?.length === 0 ? (
              <EstadoVacio
                icono={<IconoDeducibles className="h-6 w-6" />}
                mensaje="Sin gastos todavía"
                detalle="Los gastos que registres podrán marcarse aquí como deducibles."
              />
            ) : (
              gastos?.map((movimiento) => (
                <article
                  key={movimiento.id}
                  className="flex items-center justify-between gap-3 border-b border-slate-100 py-3.5 first:pt-0 last:border-b-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 text-sm sm:text-base">
                      {movimiento.concepto}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {movimiento.categoria} · {formatearFecha(movimiento.fecha)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <span className="shrink-0 text-sm sm:text-base font-bold text-slate-900">
                      {formatearMoneda(movimiento.monto)}
                    </span>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={movimiento.deducible}
                      aria-label={`Marcar ${movimiento.concepto} como deducible`}
                      onClick={() =>
                        void alternarDeducible(
                          movimiento.id,
                          movimiento.deducible,
                        )
                      }
                      disabled={
                        actualizarMovimiento.isPending || alternandoId !== null
                      }
                      className={
                        movimiento.deducible
                          ? 'relative h-6 w-11 rounded-full bg-emerald-500 transition disabled:opacity-50'
                          : 'relative h-6 w-11 rounded-full bg-slate-300 transition hover:bg-slate-400 disabled:opacity-50'
                      }
                    >
                      <span
                        className={
                          movimiento.deducible
                            ? 'absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition'
                            : 'absolute left-6 top-1 h-4 w-4 rounded-full bg-white transition'
                        }
                      />
                    </button>
                  </div>
                </article>
              ))
            ))}
        </div>
      </section>
    </div>
  )
}

export default Deducciones