import React, { useState } from 'react'
import { consultarCFDISat } from '../api/taxtechApi'
import { useImportarCFDI } from '../hooks/useFinanzas'
import type { ComprobanteCFDI } from '../types'
import { formatearMoneda } from '../utils/format'

interface ModalPortalSatProps {
  abierto: boolean
  onCerrar: () => void
  onNotificar: (mensaje: string, tipo: 'exito' | 'error') => void
}

type PasoSimulacion = 'login' | 'consulta' | 'resultados' | 'importando' | 'exito'
type TipoAutenticacion = 'ciec' | 'efirma'
type TipoConsulta = 'Recibidos' | 'Emitidos'

export const ModalPortalSat: React.FC<ModalPortalSatProps> = ({
  abierto,
  onCerrar,
  onNotificar,
}) => {
  const [paso, setPaso] = useState<PasoSimulacion>('login')
  const [tipoAuth, setTipoAuth] = useState<TipoAutenticacion>('ciec')
  const [tipoConsulta, setTipoConsulta] = useState<TipoConsulta>('Recibidos')

  // Datos formulario Login
  const [rfc, setRfc] = useState('GOCM850412H84')
  const [password, setPassword] = useState('••••••••••••')
  const [archivoCer, setArchivoCer] = useState<string | null>(null)
  const [archivoKey, setArchivoKey] = useState<string | null>(null)
  const [cargandoAuth, setCargandoAuth] = useState(false)

  // Datos de consulta
  const [cargandoConsulta, setCargandoConsulta] = useState(false)
  const [comprobantes, setComprobantes] = useState<ComprobanteCFDI[]>([])
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set())
  const [cfdiDetalle, setCfdiDetalle] = useState<ComprobanteCFDI | null>(null)

  // Hook importación
  const mutationImportar = useImportarCFDI()

  if (!abierto) return null

  const manejarLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setCargandoAuth(true)

    setTimeout(() => {
      setCargandoAuth(false)
      setPaso('consulta')
    }, 900)
  }

  const manejarConsultar = async () => {
    setCargandoConsulta(true)
    try {
      const res = await consultarCFDISat({ tipo: tipoConsulta, rfc })
      if (res.ok) {
        setComprobantes(res.comprobantes)
        // Seleccionar todos por defecto
        const todosUuids = new Set(res.comprobantes.map((c) => c.uuid))
        setSeleccionados(todosUuids)
        setPaso('resultados')
      } else {
        onNotificar('No se pudieron recuperar facturas del SAT.', 'error')
      }
    } catch {
      onNotificar('Error de conexión con el servicio del SAT.', 'error')
    } finally {
      setCargandoConsulta(false)
    }
  }

  const toggleSeleccion = (uuid: string) => {
    setSeleccionados((prev) => {
      const nuevo = new Set(prev)
      if (nuevo.has(uuid)) {
        nuevo.delete(uuid)
      } else {
        nuevo.add(uuid)
      }
      return nuevo
    })
  }

  const toggleSeleccionarTodos = () => {
    if (seleccionados.size === comprobantes.length) {
      setSeleccionados(new Set())
    } else {
      setSeleccionados(new Set(comprobantes.map((c) => c.uuid)))
    }
  }

  const manejarImportar = async () => {
    const elegidos = comprobantes.filter((c) => seleccionados.has(c.uuid))
    if (elegidos.length === 0) {
      onNotificar('Selecciona al menos una factura para importar.', 'error')
      return
    }

    setPaso('importando')

    try {
      const res = await mutationImportar.mutateAsync(elegidos)
      if (res.ok) {
        setPaso('exito')
        onNotificar(`¡${res.importados} facturas importadas correctamente a TaxTech!`, 'exito')
      } else {
        onNotificar(res.mensaje || 'Error al importar facturas.', 'error')
        setPaso('resultados')
      }
    } catch {
      onNotificar('Error al procesar la importación a la base de datos.', 'error')
      setPaso('resultados')
    }
  }

  const reiniciarModal = () => {
    setPaso('login')
    setComprobantes([])
    setSeleccionados(new Set())
    setCfdiDetalle(null)
    onCerrar()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/80 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sat-modal-title"
    >
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-900/10">
        {/* Encabezado Oficial Estilo SAT */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xl font-bold tracking-wider text-emerald-300 backdrop-blur-sm">
                SAT
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
                  Gobierno de México • Hacienda
                </p>
                <h2 id="sat-modal-title" className="text-lg font-bold">
                  Portal de Servicios Tributarios (Simulador CFDI 4.0)
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={reiniciarModal}
              className="rounded-full p-2 text-emerald-200 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Cerrar modal"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Indicador de pasos */}
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <div className={`flex items-center gap-2 ${paso === 'login' ? 'text-emerald-700 font-bold' : ''}`}>
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${paso === 'login' ? 'bg-emerald-600 text-white' : 'bg-slate-200'}`}>1</span>
              Autenticación
            </div>
            <div className="h-0.5 flex-1 bg-slate-200 mx-3" />
            <div className={`flex items-center gap-2 ${paso === 'consulta' ? 'text-emerald-700 font-bold' : ''}`}>
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${paso === 'consulta' ? 'bg-emerald-600 text-white' : 'bg-slate-200'}`}>2</span>
              Consulta
            </div>
            <div className="h-0.5 flex-1 bg-slate-200 mx-3" />
            <div className={`flex items-center gap-2 ${paso === 'resultados' || paso === 'importando' || paso === 'exito' ? 'text-emerald-700 font-bold' : ''}`}>
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${paso === 'resultados' || paso === 'exito' ? 'bg-emerald-600 text-white' : 'bg-slate-200'}`}>3</span>
              Selección e Importación
            </div>
          </div>
        </div>

        {/* Cuerpo del Modal */}
        <div className="max-h-[75vh] overflow-y-auto p-6">
          {/* PASO 1: LOGIN */}
          {paso === 'login' && (
            <div className="mx-auto max-w-lg space-y-6">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 text-emerald-900">
                <div className="flex items-start gap-3">
                  <span className="text-xl">🔐</span>
                  <div>
                    <h3 className="text-sm font-bold text-emerald-950">Acceso Seguro al Portal SAT</h3>
                    <p className="mt-1 text-xs text-emerald-800">
                      Simulación de conexión cifrada SSL/TLS. Ingresa tus credenciales o utiliza los datos precargados para continuar.
                    </p>
                  </div>
                </div>
              </div>

              {/* Selector CIEC vs e.firma */}
              <div className="flex rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setTipoAuth('ciec')}
                  className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                    tipoAuth === 'ciec'
                      ? 'bg-white text-emerald-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Acceso con Contraseña (CIEC)
                </button>
                <button
                  type="button"
                  onClick={() => setTipoAuth('efirma')}
                  className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                    tipoAuth === 'efirma'
                      ? 'bg-white text-emerald-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Acceso con e.firma (FIEL)
                </button>
              </div>

              <form onSubmit={manejarLogin} className="space-y-4">
                <div>
                  <label htmlFor="rfc-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    RFC del Contribuyente
                  </label>
                  <input
                    id="rfc-input"
                    type="text"
                    value={rfc}
                    onChange={(e) => setRfc(e.target.value.toUpperCase())}
                    required
                    className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold tracking-wider text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                    placeholder="GOCM850412H84"
                  />
                </div>

                {tipoAuth === 'ciec' ? (
                  <div>
                    <label htmlFor="pass-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Contraseña (CIEC)
                    </label>
                    <input
                      id="pass-input"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Certificado (.cer)
                      </label>
                      <input
                        type="file"
                        accept=".cer"
                        onChange={(e) => setArchivoCer(e.target.files?.[0]?.name || null)}
                        className="mt-1 block w-full text-xs text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-emerald-800 hover:file:bg-emerald-100"
                      />
                      {archivoCer && <p className="mt-1 text-[11px] text-emerald-700">✓ {archivoCer}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Clave Privada (.key)
                      </label>
                      <input
                        type="file"
                        accept=".key"
                        onChange={(e) => setArchivoKey(e.target.files?.[0]?.name || null)}
                        className="mt-1 block w-full text-xs text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-emerald-800 hover:file:bg-emerald-100"
                      />
                      {archivoKey && <p className="mt-1 text-[11px] text-emerald-700">✓ {archivoKey}</p>}
                    </div>

                    <div>
                      <label htmlFor="key-pass-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Contraseña de Clave Privada
                      </label>
                      <input
                        id="key-pass-input"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={cargandoAuth}
                  className="w-full rounded-xl bg-emerald-700 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 disabled:opacity-50"
                >
                  {cargandoAuth ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Autenticando con el SAT...
                    </span>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </button>
              </form>
            </div>
          )}

          {/* PASO 2: SELECCIÓN DE CONSULTA */}
          {paso === 'consulta' && (
            <div className="mx-auto max-w-xl space-y-6">
              <div className="flex items-center justify-between rounded-2xl bg-slate-900 p-4 text-white">
                <div>
                  <p className="text-xs font-semibold text-emerald-400">Contribuyente Autenticado</p>
                  <p className="text-base font-bold">{rfc}</p>
                </div>
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                  Sesión Activa CFDI 4.0
                </span>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  Selecciona el servicio de facturación
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setTipoConsulta('Recibidos')}
                    className={`rounded-2xl border-2 p-5 text-left transition-all ${
                      tipoConsulta === 'Recibidos'
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-600/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">📥</span>
                      <span className={`text-xs font-bold ${tipoConsulta === 'Recibidos' ? 'text-emerald-700' : 'text-slate-400'}`}>
                        Gastos / Compras
                      </span>
                    </div>
                    <h4 className="mt-3 text-base font-black text-slate-900">Facturas Recibidas</h4>
                    <p className="mt-1 text-xs text-slate-600">
                      Comprobantes que te emitieron proveedores y servicios (Deducciones).
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTipoConsulta('Emitidos')}
                    className={`rounded-2xl border-2 p-5 text-left transition-all ${
                      tipoConsulta === 'Emitidos'
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-600/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">📤</span>
                      <span className={`text-xs font-bold ${tipoConsulta === 'Emitidos' ? 'text-emerald-700' : 'text-slate-400'}`}>
                        Ingresos / Ventas
                      </span>
                    </div>
                    <h4 className="mt-3 text-base font-black text-slate-900">Facturas Emitidas</h4>
                    <p className="mt-1 text-xs text-slate-600">
                      Comprobantes que expediste a tus clientes por honorarios o ventas.
                    </p>
                  </button>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600">Mes y Año</label>
                      <select className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-xs font-semibold text-slate-800">
                        <option>Septiembre 2026</option>
                        <option>Agosto 2026</option>
                        <option>Julio 2026</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600">Estado del Comprobante</label>
                      <select className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-xs font-semibold text-slate-800">
                        <option>Vigente</option>
                        <option>Todos</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPaso('login')}
                    className="rounded-xl border border-slate-300 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-100"
                  >
                    ← Volver
                  </button>
                  <button
                    type="button"
                    onClick={manejarConsultar}
                    disabled={cargandoConsulta}
                    className="flex-1 rounded-xl bg-emerald-700 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-700/20 hover:bg-emerald-800 disabled:opacity-50"
                  >
                    {cargandoConsulta ? 'Buscando facturas en el SAT...' : 'Buscar Comprobantes CFDI'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PASO 3: RESULTADOS Y SELECCIÓN */}
          {paso === 'resultados' && (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Comprobantes Encontrados en el SAT ({tipoConsulta})
                  </h3>
                  <p className="text-xs text-slate-600">
                    Selecciona los CFDI que deseas importar directamente a tu contabilidad de TaxTech.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleSeleccionarTodos}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                  >
                    {seleccionados.size === comprobantes.length ? 'Desmarcar todos' : 'Marcar todos'}
                  </button>
                </div>
              </div>

              {/* Tabla de CFDIs */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-bold tracking-wider">
                    <tr>
                      <th className="p-3 text-center">Sel.</th>
                      <th className="p-3">Folio Fiscal / Emisor</th>
                      <th className="p-3">Concepto</th>
                      <th className="p-3 text-right">Total</th>
                      <th className="p-3 text-center">Tipo</th>
                      <th className="p-3 text-center">Detalle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {comprobantes.map((cfdi) => {
                      const estaSeleccionado = seleccionados.has(cfdi.uuid)
                      return (
                        <tr
                          key={cfdi.uuid}
                          className={`transition-colors ${
                            estaSeleccionado ? 'bg-emerald-50/60 hover:bg-emerald-50' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={estaSeleccionado}
                              onChange={() => toggleSeleccion(cfdi.uuid)}
                              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="p-3">
                            <p className="font-bold text-slate-900">{cfdi.nombreEmisor}</p>
                            <p className="text-[10px] font-mono text-slate-500">{cfdi.rfcEmisor} • {cfdi.uuid.slice(0, 18)}...</p>
                          </td>
                          <td className="p-3 max-w-xs truncate text-slate-700">
                            {cfdi.concepto}
                          </td>
                          <td className="p-3 text-right font-bold text-slate-900">
                            {formatearMoneda(cfdi.total)}
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                cfdi.tipo === 'Ingreso'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {cfdi.tipo}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => setCfdiDetalle(cfdi)}
                              className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-200"
                            >
                              Ver PDF/XML
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pie de selección */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-slate-900 p-4 text-white">
                <div>
                  <p className="text-xs text-slate-400">Seleccionados para importación</p>
                  <p className="text-lg font-bold">
                    {seleccionados.size} de {comprobantes.length} facturas
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPaso('consulta')}
                    className="rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800"
                  >
                    Cambiar filtro
                  </button>
                  <button
                    type="button"
                    onClick={manejarImportar}
                    disabled={seleccionados.size === 0}
                    className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 disabled:opacity-50"
                  >
                    Importar a TaxTech →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PASO 4: IMPORTANDO */}
          {paso === 'importando' && (
            <div className="py-12 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <span className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Sincronizando con TaxTech...</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Procesando facturas electrónicas, convirtiendo estructura XML a movimientos contables y reevaluando tu deducción e impuestos en SQLite.
              </p>
            </div>
          )}

          {/* PASO 5: ÉXITO */}
          {paso === 'exito' && (
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600">
                ✓
              </div>
              <h3 className="text-xl font-bold text-slate-900">¡Importación Exitosa!</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Los comprobantes seleccionados han sido agregados a tu contabilidad. Las métricas del Dashboard, deducciones estimadas e impuestos ISR han sido recalculados automáticamente.
              </p>
              <button
                type="button"
                onClick={reiniciarModal}
                className="mt-4 rounded-xl bg-emerald-700 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-700/20 hover:bg-emerald-800"
              >
                Volver al Dashboard
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DETALLE CFDI (VISTA PREVIA PDF / XML) */}
      {cfdiDetalle && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="text-sm font-bold text-slate-900">Representación Impresa CFDI 4.0</h4>
              <button
                type="button"
                onClick={() => setCfdiDetalle(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                ✕ Cerrar
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 border border-slate-200">
                <div>
                  <p className="font-bold text-slate-500 uppercase">Emisor</p>
                  <p className="font-bold text-slate-900">{cfdiDetalle.nombreEmisor}</p>
                  <p className="font-mono text-slate-600">{cfdiDetalle.rfcEmisor}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-500 uppercase">Receptor</p>
                  <p className="font-bold text-slate-900">{cfdiDetalle.nombreReceptor}</p>
                  <p className="font-mono text-slate-600">{cfdiDetalle.rfcReceptor}</p>
                </div>
              </div>

              <div>
                <p className="font-bold text-slate-500 uppercase">Folio Fiscal (UUID)</p>
                <p className="font-mono text-xs font-bold text-emerald-800">{cfdiDetalle.uuid}</p>
              </div>

              <div>
                <p className="font-bold text-slate-500 uppercase">Concepto</p>
                <p className="font-semibold text-slate-800">{cfdiDetalle.concepto}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 rounded-xl bg-emerald-50/50 p-3 text-right">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase">Subtotal</p>
                  <p className="font-bold">{formatearMoneda(cfdiDetalle.subtotal)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase">IVA (16%)</p>
                  <p className="font-bold">{formatearMoneda(cfdiDetalle.iva)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase">Total CFDI</p>
                  <p className="font-black text-emerald-900 text-sm">{formatearMoneda(cfdiDetalle.total)}</p>
                </div>
              </div>

              <div className="rounded-xl border border-dashed border-slate-300 p-3 bg-slate-50 font-mono text-[9px] text-slate-500 break-all">
                Cadena Original Complemento Certificación Digital SAT:<br />
                ||1.1|{cfdiDetalle.uuid}|2026-09-21T13:40:00|SAT970701NN3|{cfdiDetalle.total}||
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
