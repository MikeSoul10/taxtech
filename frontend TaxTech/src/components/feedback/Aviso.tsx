interface AvisoProps {
  tono?: 'exito' | 'error'
  mensaje: string
}

function Aviso({ tono = 'exito', mensaje }: AvisoProps) {
  return (
    <div
      role="status"
      className={
        tono === 'exito'
          ? 'flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800'
          : 'flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800'
      }
    >
      <span
        className={
          tono === 'exito'
            ? 'inline-block h-2 w-2 rounded-full bg-emerald-500'
            : 'inline-block h-2 w-2 rounded-full bg-red-500'
        }
      />
      {mensaje}
    </div>
  )
}

export default Aviso