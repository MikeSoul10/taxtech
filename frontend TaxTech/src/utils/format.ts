const formatoMoneda = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

const formatoFecha = new Intl.DateTimeFormat('es-MX', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const formatoFechaLarga = new Intl.DateTimeFormat('es-MX', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const formatoPorcentaje = new Intl.NumberFormat('es-MX', {
  style: 'percent',
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
})

export function formatearMoneda(valor?: number | null): string {
  if (valor === undefined || valor === null || isNaN(valor)) {
    return formatoMoneda.format(0)
  }
  return formatoMoneda.format(valor)
}

export function formatearFecha(fecha?: string | Date | null): string {
  if (!fecha) return '—'
  try {
    const d = typeof fecha === 'string' ? new Date(fecha) : fecha
    if (isNaN(d.getTime())) return '—'
    return formatoFecha.format(d)
  } catch {
    return '—'
  }
}

export function formatearFechaLarga(fecha?: string | Date | null): string {
  if (!fecha) return '—'
  try {
    const d = typeof fecha === 'string' ? new Date(fecha) : fecha
    if (isNaN(d.getTime())) return '—'
    return formatoFechaLarga.format(d)
  } catch {
    return '—'
  }
}

export function formatearPorcentaje(valor?: number | null): string {
  if (valor === undefined || valor === null || isNaN(valor)) {
    return '0%'
  }
  return formatoPorcentaje.format(valor / 100)
}