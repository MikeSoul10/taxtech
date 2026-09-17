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
    <div className="p-8">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-600">
        Panel financiero
      </p>

      <h2 className="mt-1 bg-gradient-to-r from-violet-700 via-fuchsia-600 to-amber-500 bg-clip-text text-3xl font-black tracking-tight text-transparent">
        Deducciones
      </h2>

      <p className="mt-1 text-slate-500">
        Marca manualmente qué gastos son deducibles.
      </p>

      {aviso && (
        <div className="mt-6">
          <Aviso tono={aviso.tono} mensaje={aviso.mensaje} />
        </div>
      )}

      <div className="card mt-8">
        <p className="text-sm text-slate-500">
          Total potencialmente deducible
        </p>

        {cargando ? (
          <div className="mt-2 h-10 w-64 animate-pulse rounded-lg bg-slate-200" />
        ) : (
          <p className="mt-2 text-4xl font-bold text-emerald-600">
            {formatearMoneda(resumen.data?.deducibles ?? 0)}
          </p>
        )}

        {resumen.data && (
          <p className="mt-1 text-xs text-slate-400">
            {deducibles?.length ?? 0} de {gastos?.length ?? 0} gastos marcados
            como deducibles
          </p>
        )}

        <div className="mt-8 space-y-4">
          {cargando && (
            <div className="space-y-3">
              {[0, 1].map((item) => (
                <div
                  key={item}
                  className="h-6 animate-pulse rounded bg-slate-200"
                />
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
                mensaje="Sin gastos todavía"
                detalle="Los gastos que registres podrán marcarse aquí como deducibles."
              />
            ) : (
              gastos?.map((movimiento) => (
                <div
                  key={movimiento.id}
                  className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">
                      {movimiento.concepto}
                    </p>

                    <p className="text-sm text-slate-400">
                      {movimiento.categoria} · {formatearFecha(movimiento.fecha)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <span className="font-semibold">
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
                </div>
              ))
            ))}
        </div>
      </div>
    </div>
  )
}

export default Deducciones