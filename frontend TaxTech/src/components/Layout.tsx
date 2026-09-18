import { useState, useCallback, useRef } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { IconoCheck, IconoAlerta, IconoCerrar } from './icons'

export type TipoToast = 'exito' | 'error' | 'info'

export interface ToastData {
  id: number
  mensaje: string
  tipo: TipoToast
}

export interface LayoutContextType {
  notificar: (mensaje: string, tipo?: TipoToast) => void
}

function Layout() {
  const [toast, setToast] = useState<ToastData | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const notificar = useCallback((mensaje: string, tipo: TipoToast = 'exito') => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    setToast({
      id: Date.now(),
      mensaje,
      tipo,
    })

    timerRef.current = setTimeout(() => {
      setToast(null)
    }, 4000)
  }, [])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-100 md:flex-row">
      {/* Enlace de accesibilidad para saltar directamente al contenido */}
      <a
        href="#contenido-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-xl focus:bg-violet-700 focus:px-4 focus:py-2.5 focus:text-sm focus:font-bold focus:text-white focus:shadow-2xl focus:ring-2 focus:ring-white"
      >
        Saltar al contenido principal
      </a>

      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto overscroll-contain">
        <main id="contenido-principal" tabIndex={-1} className="flex-1 outline-none">
          <Outlet context={{ notificar } satisfies LayoutContextType} />
        </main>
      </div>

      {/* Snackbar / Toast flotante para micro-interacciones accesibles */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-4 right-4 z-50 flex max-w-sm items-center gap-3 rounded-2xl p-4 shadow-2xl backdrop-blur-md transition-all duration-300 sm:bottom-6 sm:right-6 sm:max-w-md ${
            toast.tipo === 'exito'
              ? 'border border-emerald-500/30 bg-slate-900/95 text-emerald-100 ring-1 ring-emerald-500/40'
              : toast.tipo === 'error'
              ? 'border border-red-500/30 bg-slate-900/95 text-red-100 ring-1 ring-red-500/40'
              : 'border border-violet-500/30 bg-slate-900/95 text-violet-100 ring-1 ring-violet-500/40'
          }`}
        >
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
              toast.tipo === 'exito'
                ? 'bg-emerald-500/20 text-emerald-400'
                : toast.tipo === 'error'
                ? 'bg-red-500/20 text-red-400'
                : 'bg-violet-500/20 text-violet-400'
            }`}
          >
            {toast.tipo === 'exito' ? (
              <IconoCheck className="h-5 w-5" />
            ) : toast.tipo === 'error' ? (
              <IconoAlerta className="h-5 w-5" />
            ) : (
              <span className="h-2 w-2 rounded-full bg-violet-400" />
            )}
          </div>

          <p className="flex-1 text-xs font-semibold sm:text-sm">{toast.mensaje}</p>

          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Cerrar notificación"
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            <IconoCerrar className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}

export default Layout