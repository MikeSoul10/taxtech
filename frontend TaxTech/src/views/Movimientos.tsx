import { useMemo, useState } from 'react'
import EstadoError from '../components/feedback/EstadoError'
import EstadoVacio from '../components/feedback/EstadoVacio'
import Aviso from '../components/feedback/Aviso'
import Modal from '../components/Modal'
import FormularioMovimiento, {
  type DatosFormularioMovimiento,
} from '../components/movimientos/FormularioMovimiento'
import { mensajeDeError } from '../api/client'
import { formatearFecha, formatearMoneda } from '../utils/format'
import {
  useActualizarMovimiento,
  useCrearMovimiento,
  useEliminarMovimiento,
  useEliminarMovimientosMasivo,
  useMovimientos,
} from '../hooks/useFinanzas'
import type { Movimiento } from '../types'
import { IconoIngresos } from '../components/icons'

type ModoModal = 'crear' | 'editar'

const claseFiltro =
  'rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200'

function Movimientos() {
  const movimientos = useMovimientos()
  const crearMovimiento = useCrearMovimiento()
  const actualizarMovimiento = useActualizarMovimiento()
  const eliminarMovimiento = useEliminarMovimiento()
  const eliminarMasivo = useEliminarMovimientosMasivo()

  const [busqueda, setBusqueda] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState<'Todos' | 'Ingreso' | 'Gasto'>(
    'Todos',
  )
  const [mesFiltro, setMesFiltro] = useState('Todos')
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas')

  const [modal, setModal] = useState<{
    modo: ModoModal
    movimiento?: Movimiento
  } | null>(null)
  const [aviso, setAviso] = useState<{ tono: 'exito' | 'error'; mensaje: string } | null>(
    null,
  )

  const datos = useMemo(() => movimientos.data ?? [], [movimientos.data])

  const categorias = useMemo(
    () => Array.from(new Set(datos.map((m) => m.categoria))).sort(),
    [datos],
  )

  const meses = useMemo(
    () =>
      Array.from(new Set(datos.map((m) => m.fecha.slice(0, 7)))).sort((a, b) =>
        b.localeCompare(a),
      ),
    [datos],
  )

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()

    return datos.filter((movimiento) => {
      if (tipoFiltro !== 'Todos' && movimiento.tipo !== tipoFiltro) return false
      if (mesFiltro !== 'Todos' && movimiento.fecha.slice(0, 7) !== mesFiltro)
        return false
      if (categoriaFiltro !== 'Todas' && movimiento.categoria !== categoriaFiltro)
        return false
      if (texto && !movimiento.concepto.toLowerCase().includes(texto)) return false
      return true
    })
  }, [datos, busqueda, tipoFiltro, mesFiltro, categoriaFiltro])

  function cerrarModal() {
    setModal(null)
  }

  async function guardar(datosFormulario: DatosFormularioMovimiento) {
    const cuerpo = {
      concepto: datosFormulario.concepto.trim(),
      tipo: datosFormulario.tipo,
      monto: Number(datosFormulario.monto),
      fecha: datosFormulario.fecha,
      categoria: datosFormulario.categoria.trim(),
      deducible: datosFormulario.deducible,
    }

    try {
      if (modal?.modo === 'editar' && modal.movimiento) {
        await actualizarMovimiento.mutateAsync({
          id: modal.movimiento.id,
          datos: cuerpo,
        })
        setAviso({ tono: 'exito', mensaje: 'Movimiento actualizado.' })
      } else {
        await crearMovimiento.mutateAsync(cuerpo)
        setAviso({ tono: 'exito', mensaje: 'Movimiento creado.' })
      }

      cerrarModal()
    } catch (error) {
      setAviso({ tono: 'error', mensaje: mensajeDeError(error) })
    }
  }

  async function manejarEliminar(movimiento: Movimiento) {
    const confirmado = window.confirm(
      `¿Eliminar el movimiento "${movimiento.concepto}"? Esta acción no se puede deshacer.`,
    )

    if (!confirmado) return

    try {
      await eliminarMovimiento.mutateAsync(movimiento.id)
      setAviso({ tono: 'exito', mensaje: 'Movimiento eliminado.' })
    } catch (error) {
      setAviso({ tono: 'error', mensaje: mensajeDeError(error) })
    }
  }

  async function manejarEliminarMasivo(tipo: 'todos' | 'Gasto' | 'Ingreso') {
    const textoTipo =
      tipo === 'todos'
        ? 'TODOS los movimientos'
        : tipo === 'Gasto'
          ? 'todos los GASTOS'
          : 'todos los INGRESOS'

    const confirmado = window.confirm(
      `¿Estás seguro de que deseas eliminar ${textoTipo}? Esta acción borrará los registros permanentemente de tu base de datos.`,
    )

    if (!confirmado) return

    try {
      const res = await eliminarMasivo.mutateAsync(tipo)
      setAviso({
        tono: 'exito',
        mensaje: `Se eliminaron correctamente ${res.cantidadEliminados} movimiento(s).`,
      })
    } catch (error) {
      setAviso({ tono: 'error', mensaje: mensajeDeError(error) })
    }
  }

  const guardando =
    crearMovimiento.isPending || actualizarMovimiento.isPending

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-600">
            Panel financiero
          </p>

          <h1 className="mt-1 bg-gradient-to-r from-violet-700 via-fuchsia-600 to-amber-500 bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-4xl">
            Movimientos
          </h1>

          <p className="mt-1 text-sm text-slate-600">
            Registra, edita y elimina tus ingresos y gastos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setModal({ modo: 'crear' })}
            className="btn-accent"
          >
            + Nuevo movimiento
          </button>

          <button
            type="button"
            onClick={() => manejarEliminarMasivo('Ingreso')}
            disabled={eliminarMasivo.isPending}
            className="rounded-xl border border-emerald-300 bg-emerald-50/60 px-3 py-2 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-50"
          >
            🗑️ Eliminar ingresos
          </button>

          <button
            type="button"
            onClick={() => manejarEliminarMasivo('Gasto')}
            disabled={eliminarMasivo.isPending}
            className="rounded-xl border border-rose-300 bg-rose-50/60 px-3 py-2 text-xs font-bold text-rose-800 transition hover:bg-rose-100 disabled:opacity-50"
          >
            🗑️ Eliminar gastos
          </button>

          <button
            type="button"
            onClick={() => manejarEliminarMasivo('todos')}
            disabled={eliminarMasivo.isPending}
            className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-50"
          >
            ⚠️ Eliminar todo
          </button>
        </div>
      </div>

      {aviso && (
        <div className="mt-6">
          <Aviso tono={aviso.tono} mensaje={aviso.mensaje} />
        </div>
      )}

      <div className="card mt-6 sm:mt-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <input
            className={claseFiltro}
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Buscar por concepto..."
            aria-label="Buscar movimientos"
          />

          <select
            className={claseFiltro}
            value={tipoFiltro}
            onChange={(evento) =>
              setTipoFiltro(
                evento.target.value as 'Todos' | 'Ingreso' | 'Gasto',
              )
            }
            aria-label="Filtrar por tipo"
          >
            <option value="Todos">Todos los tipos</option>
            <option value="Ingreso">Solo ingresos</option>
            <option value="Gasto">Solo gastos</option>
          </select>

          <select
            className={claseFiltro}
            value={mesFiltro}
            onChange={(evento) => setMesFiltro(evento.target.value)}
            aria-label="Filtrar por mes"
          >
            <option value="Todos">Todos los meses</option>
            {meses.map((mes) => (
              <option key={mes} value={mes}>
                {formatearMes(mes)}
              </option>
            ))}
          </select>

          <select
            className={claseFiltro}
            value={categoriaFiltro}
            onChange={(evento) => setCategoriaFiltro(evento.target.value)}
            aria-label="Filtrar por categoría"
          >
            <option value="Todas">Todas las categorías</option>
            {categorias.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 space-y-4">
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
            (filtrados.length === 0 ? (
              <EstadoVacio
icono={<IconoIngresos className="h-6 w-6" />}
                mensaje={
                  datos.length === 0
                    ? 'Sin movimientos todavía'
                    : 'Sin resultados con los filtros actuales'
                }
                detalle="Registra un ingreso o gasto, o cambia los filtros de búsqueda."
              />
            ) : (
              filtrados.map((movimiento) => (
                <article
                  key={movimiento.id}
                  className="flex flex-col gap-3 border-b border-slate-100 py-3.5 first:pt-0 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
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

                  <div className="flex items-center gap-3">
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

                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setModal({ modo: 'editar', movimiento })
                        }
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-violet-300 hover:text-violet-700"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => void manejarEliminar(movimiento)}
                        disabled={eliminarMovimiento.isPending}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ))}
        </div>
      </div>

      {modal && (
        <Modal
          titulo={modal.modo === 'crear' ? 'Nuevo movimiento' : 'Editar movimiento'}
          onCerrar={cerrarModal}
        >
          <FormularioMovimiento
            inicial={datosInicialesMovimiento(modal.movimiento)}
            categorias={categorias}
            guardando={guardando}
            notaAccion={modal.modo === 'crear' ? 'Crear movimiento' : 'Guardar cambios'}
            onCancelar={cerrarModal}
            onGuardar={(datosFormulario) => void guardar(datosFormulario)}
          />
        </Modal>
      )}
    </div>
  )
}

function datosInicialesMovimiento(
  movimiento?: Movimiento,
): DatosFormularioMovimiento {
  if (!movimiento) {
    const ahora = new Date()
    const mes = String(ahora.getMonth() + 1).padStart(2, '0')
    const dia = String(ahora.getDate()).padStart(2, '0')

    return {
      concepto: '',
      tipo: 'Gasto',
      monto: '',
      fecha: `${ahora.getFullYear()}-${mes}-${dia}`,
      categoria: '',
      deducible: false,
    }
  }

  return {
    concepto: movimiento.concepto,
    tipo: movimiento.tipo,
    monto: String(movimiento.monto),
    fecha: new Date(movimiento.fecha).toISOString().slice(0, 10),
    categoria: movimiento.categoria,
    deducible: movimiento.deducible,
  }
}

function formatearMes(mes: string): string {
  const [anio, numeroMes] = mes.split('-')
  const fecha = new Date(Number(anio), Number(numeroMes) - 1, 1)

  const texto = new Intl.DateTimeFormat('es-MX', {
    month: 'long',
    year: 'numeric',
  }).format(fecha)

  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

export default Movimientos