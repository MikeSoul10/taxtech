import type { ReactNode } from 'react'

interface EstadoVacioProps {
  mensaje: string
  detalle?: string
  icono?: ReactNode
}

function EstadoVacio({ mensaje, detalle, icono }: EstadoVacioProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-6 sm:p-8 text-center"
    >
      {icono && (
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-200/70 text-slate-500">
          {icono}
        </div>
      )}

      <p className="text-sm font-bold text-slate-700 sm:text-base">{mensaje}</p>

      {detalle && (
        <p className="mt-1.5 max-w-md text-xs sm:text-sm text-slate-500">
          {detalle}
        </p>
      )}
    </div>
  )
}

export default EstadoVacio