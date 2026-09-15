import EstadoError from '../components/feedback/EstadoError'
import EstadoVacio from '../components/feedback/EstadoVacio'
import { mensajeDeError } from '../api/client'
import { formatearFecha, formatearMoneda } from '../utils/format'
import { useMovimientos } from '../hooks/useFinanzas'

function Movimientos() {
  const movimientos = useMovimientos()

  return (
    <div className="p-8">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-600">
        Panel financiero
      </p>

      <h2 className="mt-1 bg-gradient-to-r from-violet-700 via-fuchsia-600 to-amber-500 bg-clip-text text-3xl font-black tracking-tight text-transparent">
        Movimientos
      </h2>

      <p className="mt-1 text-slate-500">
        Historial reciente de ingresos y gastos.
      </p>

      <div className="card mt-8">
        <div className="space-y-4">
          {movimientos.isLoading && (
            <div className="space-y-4">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-12 animate-pulse rounded-xl bg-slate-200"
                />
              ))}
              <p className="text-slate-500">Cargando movimientos...</p>
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
                mensaje="Sin movimientos todavía"
                detalle="Los ingresos y gastos que registres aparecerán aquí."
              />
            ) : (
              movimientos.data?.map((movimiento) => (
                <div
                  key={movimiento.id}
                  className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-b-0"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {movimiento.concepto}
                    </p>

                    <p className="text-sm text-slate-400">
                      {movimiento.tipo} · {movimiento.categoria} ·{' '}
                      {formatearFecha(movimiento.fecha)}
                    </p>
                  </div>

                  <p
                    className={
                      movimiento.tipo === 'Ingreso'
                        ? 'font-semibold text-emerald-600'
                        : 'font-semibold text-red-500'
                    }
                  >
                    {movimiento.tipo === 'Ingreso' ? '+' : '-'}
                    {formatearMoneda(movimiento.monto)}
                  </p>
                </div>
              ))
            ))}
        </div>
      </div>
    </div>
  )
}

export default Movimientos