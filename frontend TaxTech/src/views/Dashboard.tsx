import { useState } from 'react'
import { Link } from 'react-router-dom'
import StatCard from '../components/StatCard'
import EstadoError from '../components/feedback/EstadoError'
import EstadoVacio from '../components/feedback/EstadoVacio'
import GraficoIngresosGastos from '../components/GraficoIngresosGastos'
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
  const [mensaje, setMensaje] = useState('')

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
    setMensaje('Sincronizando CFDI...')

    try {
      const resultado = await sincronizarCFDI()

      setMensaje(
        `${resultado.comprobantesEncontrados} comprobantes encontrados`,
      )
    } catch {
      setMensaje('Error al sincronizar CFDI')
    } finally {
      setSincronizando(false)
    }
  }

  return (
    <div className="relative min-h-full overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-violet-300/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-28 top-48 h-80 w-80 rounded-full bg-fuchsia-300/30 blur-3xl"
      />

      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-600">
              Panel financiero
            </p>

            <h2 className="mt-1 bg-gradient-to-r from-violet-700 via-fuchsia-600 to-amber-500 bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-4xl">
              Dashboard
            </h2>

            <p className="mt-1 text-slate-500">
              Resumen financiero de septiembre 2026
            </p>
          </div>

          <button
            onClick={manejarSincronizacion}
            disabled={sincronizando}
            className="btn-accent"
          >
            <IconoVistaPrevia className="h-5 w-5" />
            {sincronizando ? 'Sincronizando...' : 'Sincronizar CFDI'}
          </button>
        </header>

        {mensaje && (
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm font-medium text-violet-800">
            <span className="h-2 w-2 animate-pulse rounded-full bg-violet-500" />
            {mensaje}
          </div>
        )}

        {resumen.isLoading ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {arrayCuatro.map((item) => (
              <div
                key={item}
                className="h-40 animate-pulse rounded-2xl bg-slate-200"
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
            <section className="relative mt-8 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-violet-900 to-fuchsia-800 p-6 text-white shadow-2xl shadow-violet-900/30 sm:p-8">
              <div
                aria-hidden
                className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-fuchsia-400/20 blur-2xl"
              />
              <div
                aria-hidden
                className="absolute bottom-0 right-40 h-32 w-32 rounded-full bg-amber-300/20 blur-2xl"
              />

              <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-medium text-violet-200">
                    Saldo neto del periodo
                  </p>

                  <p className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
                    {formatearMoneda(saldoNeto)}
                  </p>

                  <p className="mt-2 text-sm text-violet-200/80">
                    Ingresos − gastos del periodo
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm ring-1 ring-white/20">
                    <p className="text-xs text-violet-200">Ingresos</p>
                    <p className="mt-1 text-lg font-bold">
                      {formatearMoneda(datos?.ingresos ?? 0)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm ring-1 ring-white/20">
                    <p className="text-xs text-violet-200">Gastos</p>
                    <p className="mt-1 text-lg font-bold">
                      {formatearMoneda(datos?.gastos ?? 0)}
                    </p>
                  </div>

                  <Link
                    to="/impuestos"
                    className="col-span-2 rounded-2xl bg-amber-400/20 p-4 ring-1 ring-amber-300/40 transition hover:bg-amber-400/30 sm:col-span-1"
                  >
                    <p className="text-xs text-amber-200">Reserva fiscal</p>
                    <p className="mt-1 text-lg font-bold">
                      {formatearMoneda(datos?.reservaFiscal ?? 0)}
                    </p>
                  </Link>
                </div>
              </div>
            </section>

            <section className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
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

            <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="card lg:col-span-2">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">
                    Ingresos vs gastos por mes
                  </h3>

                  <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Gráfica del historial
                  </span>
                </div>

                <GraficoIngresosGastos movimientos={movimientos.data ?? []} />
              </div>

              <div className="card">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">
                    Movimientos recientes
                  </h3>

                  <Link
                    to="/movimientos"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-violet-600 transition hover:text-violet-800"
                  >
                    Ver todos
                    <IconoFlecha className="h-4 w-4" />
                  </Link>
                </div>

                <div className="space-y-4">
                  {movimientos.isLoading && (
                    <div className="space-y-3">
                      {[0, 1].map((item) => (
                        <div
                          key={item}
                          className="h-6 animate-pulse rounded bg-slate-200"
                        />
                      ))}
                    </div>
                  )}

                  {movimientos.isError && (
                    <p className="text-sm text-red-500">
                      No se pudieron cargar los movimientos.
                    </p>
                  )}

                  {!movimientos.isLoading &&
                    !movimientos.isError &&
                    (movimientos.data?.length === 0 ? (
                      <EstadoVacio
                        mensaje="Sin movimientos todavía"
                        detalle="Registra un ingreso o gasto para comenzar."
                      />
                    ) : (
                      movimientos.data?.map((movimiento) => (
                        <div
                          key={movimiento.id}
                          className="flex justify-between border-b border-slate-100 pb-3 last:border-b-0"
                        >
                          <span className="font-medium text-slate-700">
                            {movimiento.concepto}
                          </span>

                          <span
                            className={
                              movimiento.tipo === 'Ingreso'
                                ? 'font-semibold text-emerald-600'
                                : 'font-semibold text-red-500'
                            }
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
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-fuchsia-600 to-violet-700 p-6 text-white shadow-lg transition hover:-translate-y-1 hover:shadow-2xl"
              >
                <div
                  aria-hidden
                  className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-xl transition group-hover:scale-125"
                />

                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
                      <IconoBanca />
                    </div>

                    <IconoFlecha className="h-5 w-5 text-white/60 transition group-hover:translate-x-1 group-hover:text-white" />
                  </div>

                  <h3 className="mt-5 text-lg font-bold">Reserva fiscal</h3>

                  <p className="mt-1 text-3xl font-black">
                    {formatearMoneda(datos?.reservaFiscal ?? 0)}
                  </p>

                  <p className="mt-2 text-sm text-white/70">
                    Cobertura de tu impuesto estimado
                  </p>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/20">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-300 to-lime-300 transition-all"
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