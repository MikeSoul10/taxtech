interface EstadoErrorProps {
  mensaje?: string
  onReintentar?: () => void
}

function EstadoError({ mensaje, onReintentar }: EstadoErrorProps) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center ring-1 ring-red-100">
      <p className="text-sm font-semibold text-red-700">
        No se pudo cargar la información
      </p>

      {mensaje && <p className="mt-1 text-sm text-red-500">{mensaje}</p>}

      {onReintentar && (
        <button
          type="button"
          onClick={onReintentar}
          className="btn-primary mt-4"
        >
          Reintentar
        </button>
      )}
    </div>
  )
}

export default EstadoError