import EstadoError from '../components/feedback/EstadoError'
import { mensajeDeError } from '../api/client'
import { formatearMoneda } from '../utils/format'
import { useResumenFinanciero } from '../hooks/useFinanzas'

function Impuestos() {
  const resumen = useResumenFinanciero()

  return (
    <div className="p-8">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-600">
        Panel financiero
      </p>

      <h2 className="mt-1 bg-gradient-to-r from-violet-700 via-fuchsia-600 to-amber-500 bg-clip-text text-3xl font-black tracking-tight text-transparent">
        Impuestos
      </h2>

      <p className="mt-1 text-slate-500">
        Estimación fiscal del periodo actual.
      </p>

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
              </div>

              <div className="card">
                <p className="text-sm text-slate-500">Reserva fiscal actual</p>

                <p className="mt-2 text-4xl font-bold text-slate-900">
                  {formatearMoneda(resumen.data.reservaFiscal)}
                </p>
              </div>
            </>
          )}
      </div>
    </div>
  )
}

export default Impuestos