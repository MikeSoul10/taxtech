import { IconoAlerta, IconoReintentar } from '../icons'

interface EstadoErrorProps {
  mensaje?: string
  onReintentar?: () => void
}

function EstadoError({ mensaje, onReintentar }: EstadoErrorProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/80 p-6 sm:p-8 text-center ring-1 ring-red-200/60"
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
        <IconoAlerta className="h-6 w-6" />
      </div>

      <p className="text-base font-bold text-red-900">
        No se pudo cargar la información
      </p>

      {mensaje && (
        <p className="mt-1 max-w-md text-sm text-red-700 font-medium">
          {mensaje}
        </p>
      )}

      {onReintentar && (
        <button
          type="button"
          onClick={onReintentar}
          aria-label="Reintentar cargar la información"
          className="btn-primary mt-5 inline-flex items-center gap-2"
        >
          <IconoReintentar className="h-4 w-4" />
          <span>Reintentar</span>
        </button>
      )}
    </div>
  )
}

export default EstadoError