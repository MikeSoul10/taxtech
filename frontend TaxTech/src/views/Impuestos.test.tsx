import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import App from '../App'
import { renderConProveedores } from '../test/testUtils'
import { server } from '../test/setup'

function renderizarImpuestos() {
  return renderConProveedores(<App />, { rutaInicial: '/impuestos' })
}

describe('Impuestos', () => {
  it('muestra el desglose del cálculo ISR (smoke)', async () => {
    renderizarImpuestos()

    expect(
      await screen.findByRole('heading', { name: 'Impuestos' }),
    ).toBeInTheDocument()

    expect((await screen.findAllByText('$92.45')).length).toBeGreaterThan(0)
    expect(screen.getByText('$3,500')).toBeInTheDocument()
    expect(screen.getByText('Desglose del cálculo')).toBeInTheDocument()

    const desglose = screen
      .getByText('Desglose del cálculo')
      .closest('.card')!

    expect(desglose).toHaveTextContent('Ingresos')
    expect(desglose).toHaveTextContent('$5,350')
    expect(desglose).toHaveTextContent('Deducciones aplicadas (tope 10%)')
    expect(desglose).toHaveTextContent('$535')
    expect(desglose).toHaveTextContent('Base gravable')
    expect(desglose).toHaveTextContent('$4,815')
    expect(desglose).toHaveTextContent('Tramo con tasa 1.92%')
    expect(desglose).toHaveTextContent('ISR estimado')
  })

  it('reserva un porcentaje de ingresos y actualiza la reserva fiscal', async () => {
    const usuario = userEvent.setup()
    renderizarImpuestos()

    await screen.findAllByText('$92.45')
    expect(screen.getByText('$3,500')).toBeInTheDocument()

    await usuario.click(
      screen.getByRole('button', { name: 'Reservar 20% de ingresos' }),
    )

    expect(
      await screen.findByText(
        'Reserva registrada por $1,070.',
      ),
    ).toBeInTheDocument()

    await vi.waitFor(() => {
      expect(screen.queryByText('$3,500')).not.toBeInTheDocument()
    })
    expect(screen.getByText('$4,570')).toBeInTheDocument()
  })

  it('muestra estado de error con reintento', async () => {
    server.use(
      http.get('*/api/resumen', () =>
        HttpResponse.json(
          { mensaje: 'Servicio no disponible' },
          { status: 500 },
        ),
      ),
    )

    renderizarImpuestos()

    expect(
      await screen.findByText('No se pudo cargar la información'),
    ).toBeInTheDocument()
  })

  it('permite elegir otro porcentaje con la entrada numérica', async () => {
    const usuario = userEvent.setup()
    renderizarImpuestos()

    await screen.findAllByText('$92.45')

    const entrada = screen.getByLabelText('Porcentaje a reservar')
    await usuario.clear(entrada)
    await usuario.type(entrada, '30')

    expect(
      screen.getByRole('button', { name: 'Reservar 30% de ingresos' }),
    ).toBeInTheDocument()
  })
})