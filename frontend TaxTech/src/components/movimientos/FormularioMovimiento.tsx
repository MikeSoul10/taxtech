import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'

interface PropsCampo {
  etiqueta: string
  children: ReactNode
}

function Campo({ etiqueta, children }: PropsCampo) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{etiqueta}</span>
      <div className="mt-1">{children}</div>
    </label>
  )
}

const claseCampo =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200 disabled:cursor-not-allowed disabled:opacity-60'

export interface DatosFormularioMovimiento {
  concepto: string
  tipo: 'Ingreso' | 'Gasto'
  monto: string
  fecha: string
  categoria: string
  deducible: boolean
}

interface PropsFormularioMovimiento {
  inicial: DatosFormularioMovimiento
  categorias: string[]
  guardando: boolean
  notaAccion: string
  onCancelar: () => void
  onGuardar: (datos: DatosFormularioMovimiento) => void
}

function hoyISO(): string {
  const ahora = new Date()
  const mes = String(ahora.getMonth() + 1).padStart(2, '0')
  const dia = String(ahora.getDate()).padStart(2, '0')
  return `${ahora.getFullYear()}-${mes}-${dia}`
}

function FormularioMovimiento({
  inicial = {
    concepto: '',
    tipo: 'Gasto',
    monto: '',
    fecha: hoyISO(),
    categoria: '',
    deducible: false,
  },
  categorias,
  guardando,
  notaAccion,
  onCancelar,
  onGuardar,
}: PropsFormularioMovimiento) {
  const [datos, setDatos] = useState<DatosFormularioMovimiento>(inicial)

  function cambiar(campo: Partial<DatosFormularioMovimiento>) {
    setDatos((actual) => ({ ...actual, ...campo }))
  }

  function enviar(evento: FormEvent) {
    evento.preventDefault()

    if (!datos.concepto.trim() || !datos.monto || !datos.fecha) return
    onGuardar(datos)
  }

  return (
    <form onSubmit={enviar} className="space-y-4">
      <Campo etiqueta="Concepto">
        <input
          className={claseCampo}
          value={datos.concepto}
          onChange={(evento) => cambiar({ concepto: evento.target.value })}
          placeholder="Ej. Gasolina, Honorarios..."
          maxLength={120}
          required
        />
      </Campo>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo etiqueta="Tipo">
          <select
            className={claseCampo}
            value={datos.tipo}
            onChange={(evento) =>
              cambiar({
                tipo: evento.target.value as 'Ingreso' | 'Gasto',
                ...(evento.target.value === 'Ingreso'
                  ? { deducible: false }
                  : {}),
              })
            }
          >
            <option value="Ingreso">Ingreso</option>
            <option value="Gasto">Gasto</option>
          </select>
        </Campo>

        <Campo etiqueta="Monto (MXN)">
          <input
            className={claseCampo}
            type="number"
            min="0.01"
            step="0.01"
            value={datos.monto}
            onChange={(evento) => cambiar({ monto: evento.target.value })}
            placeholder="0.00"
            required
          />
        </Campo>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo etiqueta="Fecha">
          <input
            className={claseCampo}
            type="date"
            value={datos.fecha}
            onChange={(evento) => cambiar({ fecha: evento.target.value })}
            required
          />
        </Campo>

        <Campo etiqueta="Categoría">
          <input
            className={claseCampo}
            value={datos.categoria}
            onChange={(evento) => cambiar({ categoria: evento.target.value })}
            placeholder="Ej. Transporte"
            list="categorias-movimientos"
            maxLength={80}
            required
          />
          <datalist id="categorias-movimientos">
            {categorias.map((categoria) => (
              <option key={categoria} value={categoria} />
            ))}
          </datalist>
        </Campo>
      </div>

      <label
        className={
          datos.tipo === 'Gasto'
            ? 'flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-3'
            : 'flex cursor-not-allowed items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 opacity-60'
        }
      >
        <span>
          <span className="block text-sm font-semibold text-slate-700">
            Deducible
          </span>
          <span className="block text-xs text-slate-400">
            Los gastos marcados como deducibles reducen tu base gravable
          </span>
        </span>

        <input
          type="checkbox"
          checked={datos.deducible}
          disabled={datos.tipo !== 'Gasto'}
          onChange={(evento) => cambiar({ deducible: evento.target.checked })}
          className="h-5 w-5 accent-violet-600"
        />
      </label>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancelar}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
        >
          Cancelar
        </button>

        <button type="submit" disabled={guardando} className="btn-primary">
          {guardando ? 'Guardando...' : notaAccion}
        </button>
      </div>
    </form>
  )
}

export default FormularioMovimiento