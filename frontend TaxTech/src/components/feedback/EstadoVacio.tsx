interface EstadoVacioProps {
  mensaje: string
  detalle?: string
}

function EstadoVacio({ mensaje, detalle }: EstadoVacioProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <p className="text-sm font-semibold text-slate-600">{mensaje}</p>

      {detalle && <p className="mt-1 text-sm text-slate-400">{detalle}</p>}
    </div>
  )
}

export default EstadoVacio