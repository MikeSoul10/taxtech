import { NavLink } from 'react-router-dom'

const enlaces = [
  { ruta: '/', etiqueta: 'Dashboard' },
  { ruta: '/movimientos', etiqueta: 'Movimientos' },
  { ruta: '/deducciones', etiqueta: 'Deducciones' },
  { ruta: '/impuestos', etiqueta: 'Impuestos' },
]

const estilosBoton = ({ isActive }: { isActive: boolean }) =>
  `block w-full rounded-lg px-4 py-3 text-left font-medium transition ${
    isActive
      ? 'bg-white/15 text-white'
      : 'text-slate-300 hover:bg-white/5 hover:text-white'
  }`

function Sidebar() {
  return (
    <aside className="flex w-full shrink-0 flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-violet-950 p-6 text-white md:h-screen md:w-64 md:p-6">
      <div className="flex items-center justify-between md:mb-10 md:block">
        <h1 className="bg-gradient-to-r from-white to-violet-200 bg-clip-text text-2xl font-black text-transparent">
          TaxTech
        </h1>

        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-bold text-white md:hidden">
          MVP
        </span>
      </div>

      <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-violet-400 md:-mt-6 md:mb-8">
        Panel financiero
      </p>

      <nav className="mt-4 space-y-2 md:mt-0">
        {enlaces.map((enlace) => (
          <NavLink
            key={enlace.ruta}
            to={enlace.ruta}
            end={enlace.ruta === '/'}
            className={estilosBoton}
          >
            {enlace.etiqueta}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto hidden rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 md:block">
        <p className="text-sm font-bold text-white">Reserva fiscal</p>
        <p className="mt-1 text-xs text-violet-300">
          Tu ahorro para impuestos se gestiona desde la vista Impuestos.
        </p>
      </div>
    </aside>
  )
}

export default Sidebar