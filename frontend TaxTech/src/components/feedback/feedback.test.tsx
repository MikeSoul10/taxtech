import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Aviso from './Aviso'
import EstadoError from './EstadoError'
import EstadoVacio from './EstadoVacio'

describe('Aviso', () => {
  it('muestra el mensaje con tono de éxito por defecto', () => {
    render(<Aviso mensaje="Movimiento creado." />)
    expect(screen.getByText('Movimiento creado.')).toBeInTheDocument()
  })

  it('muestra el mensaje con tono de error', () => {
    render(<Aviso tono="error" mensaje="No se pudo guardar." />)
    expect(screen.getByText('No se pudo guardar.')).toBeInTheDocument()
  })
})

describe('EstadoVacio', () => {
  it('muestra mensaje y detalle', () => {
    render(
      <EstadoVacio
        mensaje="Sin movimientos todavía"
        detalle="Registra tu primer movimiento."
      />,
    )

    expect(screen.getByText('Sin movimientos todavía')).toBeInTheDocument()
    expect(
      screen.getByText('Registra tu primer movimiento.'),
    ).toBeInTheDocument()
  })

  it('omite el detalle cuando no se provee', () => {
    render(<EstadoVacio mensaje="Sin datos" />)
    expect(screen.getByText('Sin datos')).toBeInTheDocument()
  })
})

describe('EstadoError', () => {
  it('muestra el mensaje entregado', () => {
    render(<EstadoError mensaje="Error de conexión" />)
    expect(screen.getByText('Error de conexión')).toBeInTheDocument()
  })

  it('invoca onReintentar al hacer clic', async () => {
    const usuario = userEvent.setup()
    const alReintentar = vi.fn()

    render(<EstadoError mensaje="Ups" onReintentar={alReintentar} />)

    await usuario.click(
      screen.getByRole('button', {
        name: 'Reintentar cargar la información',
      }),
    )
    expect(alReintentar).toHaveBeenCalledTimes(1)
  })
})