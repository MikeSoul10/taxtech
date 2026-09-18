import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { IconoHamburguesa, IconoCerrar } from './icons'

const enlaces = [
  { ruta: '/', etiqueta: 'Dashboard' },
  { ruta: '/movimientos', etiqueta: 'Movimientos' },
  { ruta: '/deducciones', etiqueta: 'Deducciones' },
  { ruta: '/impuestos', etiqueta: 'Impuestos' },
]

const estilosBoton = ({ isActive }: { isActive: boolean }) =>
  `block w-full rounded-xl px-4 py-3 text-left font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
    isActive
      ? 'bg-white/15 text-white font-semibold shadow-inner'
      : 'text-slate-300 hover:bg-white/10 hover:text-white'
  }`

function Sidebar() {
  const [abierto, setAbierto] = useState(false)

  // Cerrar con la tecla Escape
  useEffect(() => {
    const manejarTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && abierto) {
        setAbierto(false)
      }
    }

    if (abierto) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', manejarTecla)
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', manejarTecla)
    }
  }, [abierto])

  const contenidoNavegacion = (
    <>
      <nav id="menu-navegacion" aria-label="Menú principal" className="mt-4 space-y-1.5 md:mt-0">
        {enlaces.map((enlace) => (
          <NavLink
            key={enlace.ruta}
            to={enlace.ruta}
            end={enlace.ruta === '/'}
            className={estilosBoton}
            onClick={() => setAbierto(false)}
          >
            {enlace.etiqueta}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
        <p className="text-sm font-bold text-white">Reserva fiscal</p>
        <p className="mt-1 text-xs text-violet-300">
          Tu ahorro para impuestos se gestiona desde la vista Impuestos.
        </p>
      </div>
    </>
  )

  return (
    <>
      {/* Barra superior visible solo en móvil (< md) */}
      <header className="flex h-16 w-full shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900 px-4 text-white md:hidden">
        <div className="flex items-center gap-2">
          <span className="bg-gradient-to-r from-white via-violet-200 to-fuchsia-300 bg-clip-text text-xl font-black text-transparent">
            TaxTech
          </span>
          <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-bold text-violet-300 ring-1 ring-violet-500/30">
            MVP
          </span>
        </div>

        <button
          type="button"
          onClick={() => setAbierto(!abierto)}
          aria-expanded={abierto}
          aria-controls="menu-lateral-movil"
          aria-label={abierto ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
        >
          {abierto ? <IconoCerrar className="h-5 w-5" /> : <IconoHamburguesa className="h-5 w-5" />}
        </button>
      </header>

      {/* Backdrop oscuro para móvil cuando el menú está abierto */}
      {abierto && (
        <div
          aria-hidden="true"
          onClick={() => setAbierto(false)}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm transition-opacity md:hidden"
        />
      )}

      {/* Drawer desplegable en móvil */}
      <aside
        id="menu-lateral-movil"
        aria-label="Navegación móvil"
        aria-hidden={!abierto}
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-violet-950 p-6 text-white shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          abierto ? 'translate-x-0' : '-translate-x-full pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div>
            <h2 className="bg-gradient-to-r from-white to-violet-200 bg-clip-text text-2xl font-black text-transparent">
              TaxTech
            </h2>
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">
              Panel financiero
            </p>
          </div>

          <button
            type="button"
            onClick={() => setAbierto(false)}
            aria-label="Cerrar menú de navegación"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            <IconoCerrar className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col justify-between pt-6">
          {contenidoNavegacion}
        </div>
      </aside>

      {/* Sidebar fijo permanente en escritorio (md en adelante) */}
      <aside
        aria-label="Navegación principal"
        className="hidden md:flex md:w-64 md:h-screen md:shrink-0 md:flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-violet-950 p-6 text-white"
      >
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <h1 className="bg-gradient-to-r from-white to-violet-200 bg-clip-text text-2xl font-black text-transparent">
              TaxTech
            </h1>
            <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-xs font-bold text-violet-300 ring-1 ring-violet-500/30">
              MVP
            </span>
          </div>

          <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-violet-400">
            Panel financiero
          </p>
        </div>

        <div className="flex flex-1 flex-col justify-between">
          {contenidoNavegacion}
        </div>
      </aside>
    </>
  )
}

export default Sidebar