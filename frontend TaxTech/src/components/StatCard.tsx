import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { formatearMoneda } from '../utils/format'
import { IconoFlechaEsquina } from './icons'

interface StatCardProps {
  titulo: string
  valor: number
  icono: ReactNode
  colorBadge: string
  colorBar: string
  destino?: string
  pie?: string
}

function StatCard({
  titulo,
  valor,
  icono,
  colorBadge,
  colorBar,
  destino,
  pie,
}: StatCardProps) {
  const contenido = (
    <>
      <div
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 h-1.5 ${colorBar}`}
      />

      <div className="flex items-start justify-between">
        <div
          aria-hidden="true"
          className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${colorBadge} text-white shadow-lg`}
        >
          {icono}
        </div>

        {destino && (
          <IconoFlechaEsquina className="h-5 w-5 text-slate-400 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-violet-600 group-focus-visible:text-violet-600" />
        )}
      </div>

      <p className="mt-4 text-xs sm:text-sm font-medium text-slate-600">{titulo}</p>

      <p className="mt-1 text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 break-words">
        {formatearMoneda(valor)}
      </p>

      {pie && <p className="mt-1 text-xs text-slate-500">{pie}</p>}
    </>
  )

  const clases =
    'group relative block overflow-hidden rounded-2xl bg-white p-5 sm:p-6 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2'

  if (destino) {
    return (
      <Link
        to={destino}
        aria-label={`${titulo}: ${formatearMoneda(valor)}. Haz clic para ver detalles.`}
        className={clases}
      >
        {contenido}
      </Link>
    )
  }

  return <div className={clases}>{contenido}</div>
}

export default StatCard