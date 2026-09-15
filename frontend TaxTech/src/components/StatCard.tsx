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
        aria-hidden
        className={`absolute inset-x-0 top-0 h-1.5 ${colorBar}`}
      />

      <div className="flex items-start justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${colorBadge} text-white shadow-lg`}
        >
          {icono}
        </div>

        <IconoFlechaEsquina className="h-5 w-5 text-slate-300 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-violet-500" />
      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">{titulo}</p>

      <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
        {formatearMoneda(valor)}
      </p>

      {pie && <p className="mt-1 text-xs text-slate-400">{pie}</p>}
    </>
  )

  const clases =
    'group relative block overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl'

  if (destino) {
    return (
      <Link to={destino} className={clases}>
        {contenido}
      </Link>
    )
  }

  return <div className={clases}>{contenido}</div>
}

export default StatCard