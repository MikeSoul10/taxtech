import { useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import StatCard from '../components/StatCard'
import EstadoError from '../components/feedback/EstadoError'
import EstadoVacio from '../components/feedback/EstadoVacio'
import type { LayoutContextType } from '../components/Layout'
import { sincronizarCFDI } from '../api/taxtechApi'
import { mensajeDeError } from '../api/client'
import { formatearMoneda } from '../utils/format'
import {
  useMovimientos,
  useResumenFinanciero,
} from '../hooks/useFinanzas'
import {
  IconoBanca,
  IconoDeducibles,
  IconoFlecha,
  IconoGastos,
  IconoImpuesto,
  IconoIngresos,
  IconoVistaPrevia,
} from '../components/icons'

const arrayCuatro = [0, 1, 2, 3]

function Dashboard() {
  const [sincronizando, setSincronizando] = useState(false)
  const { notificar } = useOutletContext<LayoutContextType>()

  const resumen = useResumenFinanciero()
  const movimientos = useMovimientos()

  const datos = resumen.data

  const saldoNeto = (datos?.ingresos ?? 0) - (datos?.gastos ?? 0)

  const coberturaImpuesto =
    datos && datos.impuestoEstimado > 0
      ? Math.min(100, Math.round((datos.reservaFiscal / datos.impuestoEstimado) * 100))
      : 0

  async function manejarSincronizacion() {
    setSincronizando(true)

    try {
      const resultado = await sincronizarCFDI()
      notificar(
        `Sincronización exitosa: ${resultado.comprobantesEncontrados} comprobantes CFDI encontrados.`,
        'exito'
      )
    } catch {
      notificar('Error al sincronizar con el SAT. Por favor intenta de nuevo.', 'error')
    } finally {
      setSincronizando(false)
    }
  }

  return (
    <div className="relative min-h-full overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-violet-300/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-28 top-48 h-80 w-80 rounded-full bg-fuchsia-300/20 blur-3xl"
      />

      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-600">
              Panel financiero
            </p>

            <h1 className="mt-1 bg-gradient-to-r from-violet-700 via-fuchsia-600 to-amber-500 bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-4xl">
              Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-600">
              Resumen financiero de septiembre 2026
            </p>
          </div>

          <button
            type="button"
            onClick={manejarSincronizacion}
            disabled={sincronizando}
            aria-busy={sincronizando}
            aria-label={sincronizando ? 'Sincronizando comprobantes...' : 'Sincronizar comprobantes CFDI'}
            className="btn-accent self-start sm:self-auto"
          >
            <IconoVistaPrevia className="h-5 w-5" />
            <span>{sincronizando ? 'Sincronizando...' : 'Sincronizar CFDI'}</span>
          </button>
        </header>

        {resumen.isLoading ? (
          <div
            role="status"
            aria-busy="true"
            aria-label="Cargando resumen financiero..."
            className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6"
          >
            <span className="sr-only">Cargando resumen financiero...</span>
            {arrayCuatro.map((item) => (
              <div
                key={item}
                className="h-36 sm:h-40 animate-pulse rounded-2xl bg-slate-200/80 ring-1 ring-slate-300/40"
              />
            ))}
          </div>
        ) : resumen.isError ? (
          <div className="mt-8">
            <EstadoError
              mensaje={mensajeDeError(resumen.error)}
              onReintentar={() => {
                void resumen.refetch()
                void movimientos.refetch()
              }}
            />
          </div>
        ) : (
          <>
            <section className="relative mt-8 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-violet-900 to-fuchsia-800 p-5 sm:p-8 text-white shadow-2xl shadow-violet-900/30">
              <div
                aria-hidden="true"
                className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-fuchsia-400/20 blur-2xl"
              />
              <div
                aria-hidden="true"
                className="absolute bottom-0 right-40 h-32 w-32 rounded-full bg-amber-300/20 blur-2xl"
              />

              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-violet-200">
                    Saldo neto del periodo
                  </p>

                  <p className="mt-1 sm:mt-2 text-3xl font-black tracking-tight sm:text-5xl">
                    {formatearMoneda(saldoNeto)}
                  </p>

                  <p className="mt-1 text-xs sm:text-sm text-violet-200/80">
                    Ingresos − gastos del periodo
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3">
                  <div className="rounded-2xl bg-white/10 p-3.5 sm:p-4 backdrop-blur-sm ring-1 ring-white/20">
                    <p className="text-xs text-violet-200 font-medium">Ingresos</p>
                    <p className="mt-1 text-base sm:text-lg font-bold">
                      {formatearMoneda(datos?.ingresos ?? 0)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-3.5 sm:p-4 backdrop-blur-sm ring-1 ring-white/20">
                    <p className="text-xs text-violet-200 font-medium">Gastos</p>
                    <p className="mt-1 text-base sm:text-lg font-bold">
                      {formatearMoneda(datos?.gastos ?? 0)}
                    </p>
                  </div>

                  <Link
                    to="/impuestos"
                    aria-label={`Reserva fiscal: ${formatearMoneda(datos?.reservaFiscal ?? 0)}. Ir a vista de impuestos.`}
                    className="rounded-2xl bg-amber-400/20 p-3.5 sm:p-4 ring-1 ring-amber-300/40 transition hover:bg-amber-400/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <p className="text-xs text-amber-200 font-medium">Reserva fiscal</p>
                    <p className="mt-1 text-base sm:text-lg font-bold text-white">
                      {formatearMoneda(datos?.reservaFiscal ?? 0)}
                    </p>
                  </Link>
                </div>
              </div>
            </section>

            <section aria-label="Métricas clave" className="mt-6 sm:mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
              <StatCard
                titulo="Ingresos"
                valor={datos?.ingresos ?? 0}
                icono={<IconoIngresos />}
                colorBadge="from-violet-500 to-indigo-500"
                colorBar="bg-violet-500"
                destino="/movimientos"
                pie="Ver historial de ingresos"
              />

              <StatCard
                titulo="Gastos"
                valor={datos?.gastos ?? 0}
                icono={<IconoGastos />}
                colorBadge="from-rose-500 to-red-500"
                colorBar="bg-rose-500"
                destino="/movimientos"
                pie="Ver historial de gastos"
              />

              <StatCard
                titulo="Deducibles"
                valor={datos?.deducibles ?? 0}
                icono={<IconoDeducibles />}
                colorBadge="from-emerald-500 to-teal-500"
                colorBar="bg-emerald-500"
                destino="/deducciones"
                pie="Explorar deducciones"
              />

              <StatCard
                titulo="Impuesto estimado"
                valor={datos?.impuestoEstimado ?? 0}
                icono={<IconoImpuesto />}
                colorBadge="from-amber-500 to-orange-600"
                colorBar="bg-amber-500"
                destino="/impuestos"
                pie="Ver estimación fiscal"
              />
            </section>

            <section className="mt-6 sm:mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="card">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Movimientos recientes
                  </h2>

                  <Link
                    to="/movimientos"
                    aria-label="Ver todos los movimientos"
                    className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-violet-700 transition hover:text-violet-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 rounded-lg p-1"
                  >
                    <span>Ver todos</span>
                    <IconoFlecha className="h-4 w-4" />
                  </Link>
                </div>

                <div className="space-y-3">
                  {movimientos.isLoading && (
                    <div role="status" aria-busy="true" className="space-y-3">
                      <span className="sr-only">Cargando movimientos recientes...</span>
                      {[0, 1, 2].map((item) => (
                        <div
                          key={item}
                          className="h-10 animate-pulse rounded-xl bg-slate-200/80"
                        />
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
                        mensaje="Sin movimientos todavía"
                        detalle="Registra un ingreso o gasto para comenzar."
                      />
                    ) : (
                      movimientos.data?.slice(0, 5).map((movimiento) => (
                        <div
                          key={movimiento.id}
                          className="flex items-center justify-between gap-3 border-b border-slate-100 py-3 first:pt-0 last:border-b-0"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-slate-800 text-sm">
                              {movimiento.concepto}
                            </p>
                            <p className="text-xs text-slate-500">
                              {movimiento.tipo} · {movimiento.categoria}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 text-sm sm:text-base ${
                              movimiento.tipo === 'Ingreso'
                                ? 'font-semibold text-emerald-700'
                                : 'font-semibold text-red-600'
                            }`}
                          >
                            {movimiento.tipo === 'Ingreso' ? '+' : '-'}
                            {formatearMoneda(movimiento.monto)}
                          </span>
                        </div>
                      ))
                    ))}
                </div>
              </div>

              <Link
                to="/impuestos"
                aria-label={`Reserva fiscal actual: ${formatearMoneda(datos?.reservaFiscal ?? 0)}, cobertura del ${coberturaImpuesto}%. Clic para ir a Impuestos.`}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-fuchsia-600 to-violet-700 p-6 text-white shadow-lg transition hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2"
              >
                <div
                  aria-hidden="true"
                  className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-xl transition group-hover:scale-125"
                />

                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
                      <IconoBanca />
                    </div>

                    <IconoFlecha className="h-5 w-5 text-white/70 transition group-hover:translate-x-1 group-hover:text-white" />
                  </div>

                  <h2 className="mt-5 text-base sm:text-lg font-bold">Reserva fiscal</h2>

                  <p className="mt-1 text-2xl sm:text-3xl font-black">
                    {formatearMoneda(datos?.reservaFiscal ?? 0)}
                  </p>

                  <p className="mt-2 text-xs sm:text-sm text-white/80">
                    Cobertura de tu impuesto estimado
                  </p>

                  <div className="mt-4 flex items-center gap-3">
                    <div
                      role="progressbar"
                      aria-valuenow={coberturaImpuesto}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label="Porcentaje de cobertura de impuestos"
                      className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/20"
                    >
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-300 to-lime-300 transition-all duration-500"
                        style={{ width: `${coberturaImpuesto}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold">{coberturaImpuesto}%</span>
                  </div>
                </div>
              </Link>
            </section>
          </>
        )}
      </div>
    </div>
  )
}

export default Dashboard