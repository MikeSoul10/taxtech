import { describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { renderConProveedores } from './test/testUtils'

function navegacionEscritorio() {
  return screen.getByLabelText('Navegación principal')
}

describe('App — integración de rutas', () => {
  it('navega entre las cuatro vistas desde el sidebar', async () => {
    const usuario = userEvent.setup()
    renderConProveedores(<App />, { rutaInicial: '/' })

    expect(
      await screen.findByRole('heading', { name: 'Dashboard' }),
    ).toBeInTheDocument()

    await usuario.click(
      within(navegacionEscritorio()).getByRole('link', {
        name: 'Movimientos',
      }),
    )
    expect(
      await screen.findByRole('heading', { name: 'Movimientos' }),
    ).toBeInTheDocument()
    expect(
      await screen.findByText('Ingreso Uber'),
    ).toBeInTheDocument()

    await usuario.click(
      within(navegacionEscritorio()).getByRole('link', {
        name: 'Deducciones',
      }),
    )
    expect(
      await screen.findByRole('heading', { name: 'Deducciones' }),
    ).toBeInTheDocument()

    await usuario.click(
      within(navegacionEscritorio()).getByRole('link', {
        name: 'Impuestos',
      }),
    )
    expect(
      await screen.findByRole('heading', { name: 'Impuestos' }),
    ).toBeInTheDocument()

    await usuario.click(
      within(navegacionEscritorio()).getByRole('link', {
        name: 'Dashboard',
      }),
    )
    expect(
      await screen.findByRole('heading', { name: 'Dashboard' }),
    ).toBeInTheDocument()
  })

  it('redirige las rutas desconocidas al Dashboard', async () => {
    renderConProveedores(<App />, { rutaInicial: '/no-existe' })

    expect(
      await screen.findByRole('heading', { name: 'Dashboard' }),
    ).toBeInTheDocument()
  })
})

describe('App — recálculo al cambiar un movimiento', () => {
  it('actualiza el resumen (saldo neto) tras editar un gasto', async () => {
    const usuario = userEvent.setup()
    renderConProveedores(<App />, { rutaInicial: '/movimientos' })

    expect(await screen.findByText('Ingreso Uber')).toBeInTheDocument()

    const filaGasolina = screen.getByText('Gasolina').closest('article')!
    await usuario.click(
      within(filaGasolina).getByRole('button', { name: 'Editar' }),
    )

    const dialogo = await screen.findByRole('dialog', {
      name: 'Editar movimiento',
    })
    const monto = within(dialogo).getByLabelText('Monto (MXN)')
    await usuario.clear(monto)
    await usuario.type(monto, '2000')
    await usuario.click(
      within(dialogo).getByRole('button', { name: 'Guardar cambios' }),
    )

    await screen.findByText('Movimiento actualizado.')

    await usuario.click(
      within(navegacionEscritorio()).getByRole('link', {
        name: 'Dashboard',
      }),
    )

    expect(await screen.findByText('$2,751')).toBeInTheDocument()
    await vi.waitFor(() => {
      expect(screen.queryByText('$4,031')).not.toBeInTheDocument()
    })
  })
})