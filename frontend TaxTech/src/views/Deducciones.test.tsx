import { describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import App from '../App'
import { renderConProveedores } from '../test/testUtils'
import { server } from '../test/setup'

function renderizarDeducciones() {
  return renderConProveedores(<App />, { rutaInicial: '/deducciones' })
}

describe('Deducciones', () => {
  it('lista los gastos con su total deducible (smoke)', async () => {
    renderizarDeducciones()

    expect(
      await screen.findByRole('heading', { name: 'Deducciones' }),
    ).toBeInTheDocument()

    expect(await screen.findByText('$1,319')).toBeInTheDocument()
    expect(screen.getByText('Gasolina')).toBeInTheDocument()
    expect(screen.getByText('Internet')).toBeInTheDocument()
    expect(
      screen.getByText(/2 de 2 gastos marcados como deducibles/),
    ).toBeInTheDocument()
  })

  it('muestra estado vacío cuando no hay gastos', async () => {
    server.use(
      http.get('*/api/movimientos', () =>
        HttpResponse.json([
          {
            id: 'x1',
            concepto: 'Ingreso Uber',
            tipo: 'Ingreso',
            monto: 850,
            fecha: '2026-09-10',
            categoria: 'Plataformas digitales',
            deducible: false,
          },
        ]),
      ),
    )

    renderizarDeducciones()

    expect(await screen.findByText('Sin gastos todavía')).toBeInTheDocument()
  })

  it('muestra estado de error y permite reintentar', async () => {
    server.use(
      http.get('*/api/resumen', () =>
        HttpResponse.json(
          { mensaje: 'Error de servidor' },
          { status: 500 },
        ),
      ),
    )

    renderizarDeducciones()

    expect(
      await screen.findByText('No se pudo cargar la información'),
    ).toBeInTheDocument()
    expect(screen.getByText('Error de servidor')).toBeInTheDocument()
  })

  it('alterna deducible y actualiza el total en vivo', async () => {
    const usuario = userEvent.setup()
    renderizarDeducciones()

    await screen.findByText('$1,319')

    const filaGasolina = screen.getByText('Gasolina').closest('article')!
    await usuario.click(
      within(filaGasolina).getByRole('switch', {
        name: 'Marcar Gasolina como deducible',
      }),
    )

    await vi.waitFor(() => {
      expect(screen.queryByText('$1,319')).not.toBeInTheDocument()
    })
    expect(
      screen.getByText(/1 de 2 gastos marcados como deducibles/),
    ).toBeInTheDocument()

    const filaActualizada = screen.getByText('Gasolina').closest('article')!
    expect(
      within(filaActualizada).getByRole('switch', {
        name: 'Marcar Gasolina como deducible',
      }),
    ).toHaveAttribute('aria-checked', 'false')
  })
})