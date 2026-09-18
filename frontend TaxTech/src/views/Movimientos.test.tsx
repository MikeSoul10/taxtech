import { describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import App from '../App'
import { renderConProveedores } from '../test/testUtils'
import { server } from '../test/setup'

function renderizarMovimientos() {
  return renderConProveedores(<App />, { rutaInicial: '/movimientos' })
}

describe('Movimientos — listado', () => {
  it('muestra los movimientos del API (smoke)', async () => {
    renderizarMovimientos()

    expect(
      await screen.findByRole('heading', { name: 'Movimientos' }),
    ).toBeInTheDocument()
    expect(await screen.findByText('Ingreso Uber')).toBeInTheDocument()
    expect(screen.getByText('Gasolina')).toBeInTheDocument()
    expect(screen.getByText('Servicio de diseño')).toBeInTheDocument()
    expect(screen.getByText('Internet')).toBeInTheDocument()
    expect(screen.getByText('+$850')).toBeInTheDocument()
    expect(screen.getByText('-$720')).toBeInTheDocument()
  })

  it('muestra el estado vacío cuando no hay movimientos', async () => {
    server.use(
      http.get('*/api/movimientos', () => HttpResponse.json([])),
      http.get('*/api/resumen', () =>
        HttpResponse.json({
          ingresos: 0,
          gastos: 0,
          deducibles: 0,
          impuestoEstimado: 0,
          reservaFiscal: 0,
        }),
      ),
    )

    renderizarMovimientos()

    expect(
      await screen.findByText('Sin movimientos todavía'),
    ).toBeInTheDocument()
  })

  it('muestra el estado de error con reintento cuando la API falla', async () => {
    server.use(
      http.get('*/api/movimientos', () =>
        HttpResponse.json(
          { mensaje: 'Error al cargar movimientos' },
          { status: 500 },
        ),
      ),
    )

    renderizarMovimientos()

    expect(
      await screen.findByText('No se pudo cargar la información'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Error al cargar movimientos'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Reintentar cargar la información',
      }),
    ).toBeInTheDocument()
  })

  it('filtra por concepto al escribir en la búsqueda', async () => {
    const usuario = userEvent.setup()
    renderizarMovimientos()

    await screen.findByText('Ingreso Uber')
    await usuario.type(
      screen.getByRole('textbox', { name: 'Buscar movimientos' }),
      'internet',
    )

    expect(screen.getByText('Internet')).toBeInTheDocument()
    expect(screen.queryByText('Gasolina')).not.toBeInTheDocument()
    expect(screen.queryByText('Ingreso Uber')).not.toBeInTheDocument()
  })

  it('distingue "sin resultados" cuando los filtros no coinciden', async () => {
    const usuario = userEvent.setup()
    renderizarMovimientos()

    await screen.findByText('Ingreso Uber')
    await usuario.type(
      screen.getByRole('textbox', { name: 'Buscar movimientos' }),
      'no-existe-nada',
    )

    expect(
      await screen.findByText('Sin resultados con los filtros actuales'),
    ).toBeInTheDocument()
  })
})

describe('Movimientos — alta', () => {
  it('crea un movimiento desde el formulario modal', async () => {
    const usuario = userEvent.setup()
    renderizarMovimientos()

    await usuario.click(
      screen.getByRole('button', { name: '+ Nuevo movimiento' }),
    )

    const dialogo = await screen.findByRole('dialog', {
      name: 'Nuevo movimiento',
    })

    await usuario.type(
      within(dialogo).getByLabelText('Concepto'),
      'Honorarios web',
    )
    await usuario.selectOptions(
      within(dialogo).getByLabelText('Tipo'),
      'Ingreso',
    )
    await usuario.type(
      within(dialogo).getByLabelText('Monto (MXN)'),
      '2500',
    )
    await usuario.type(
      within(dialogo).getByLabelText('Categoría'),
      'Ingresos',
    )
    await usuario.click(
      within(dialogo).getByRole('button', { name: 'Crear movimiento' }),
    )

    expect(
      await screen.findByText('Movimiento creado.'),
    ).toBeInTheDocument()

    expect(await screen.findByText('Honorarios web')).toBeInTheDocument()
    expect(screen.getByText('+$2,500')).toBeInTheDocument()
    expect(
      screen.queryByRole('dialog', { name: 'Nuevo movimiento' }),
    ).not.toBeInTheDocument()
  })

  it('no envía el formulario si faltan campos obligatorios', async () => {
    const usuario = userEvent.setup()
    renderizarMovimientos()

    await usuario.click(
      screen.getByRole('button', { name: '+ Nuevo movimiento' }),
    )
    const dialogo = await screen.findByRole('dialog', {
      name: 'Nuevo movimiento',
    })

    await usuario.type(within(dialogo).getByLabelText('Monto (MXN)'), '500')
    await usuario.click(
      within(dialogo).getByRole('button', { name: 'Crear movimiento' }),
    )

    expect(screen.queryByText('Movimiento creado.')).not.toBeInTheDocument()
    expect(dialogo).toBeInTheDocument()
  })
})

describe('Movimientos — edición y eliminación', () => {
  it('edita un movimiento y refresca la fila mostrada', async () => {
    const usuario = userEvent.setup()
    renderizarMovimientos()

    const filaGasolina = await screen.findByText('Gasolina')
    const articuloGasolina = filaGasolina.closest('article')!

    await usuario.click(
      within(articuloGasolina).getByRole('button', { name: 'Editar' }),
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

    expect(
      await screen.findByText('Movimiento actualizado.'),
    ).toBeInTheDocument()
    expect(await screen.findByText('-$2,000')).toBeInTheDocument()
    expect(screen.queryByText('-$720')).not.toBeInTheDocument()
  })

  it('elimina un movimiento tras confirmar', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const usuario = userEvent.setup()
    renderizarMovimientos()

    const filaInternet = await screen.findByText('Internet')
    const articuloInternet = filaInternet.closest('article')!

    await usuario.click(
      within(articuloInternet).getByRole('button', { name: 'Eliminar' }),
    )

    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining('Internet'),
    )
    expect(
      await screen.findByText('Movimiento eliminado.'),
    ).toBeInTheDocument()

    await vi.waitFor(() => {
      expect(screen.queryByText('Internet')).not.toBeInTheDocument()
    })
  })

  it('no elimina cuando se cancela la confirmación', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const usuario = userEvent.setup()
    renderizarMovimientos()

    const filaInternet = await screen.findByText('Internet')
    await usuario.click(
      within(filaInternet.closest('article')!).getByRole('button', {
        name: 'Eliminar',
      }),
    )

    expect(
      screen.queryByText('Movimiento eliminado.'),
    ).not.toBeInTheDocument()
    expect(screen.getByText('Internet')).toBeInTheDocument()
  })
})