import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import App from '../App'
import { renderConProveedores } from '../test/testUtils'
import { server } from '../test/setup'

function renderizarDashboard() {
  return renderConProveedores(<App />, { rutaInicial: '/' })
}

describe('Dashboard', () => {
  it('muestra el resumen financiero del API (smoke)', async () => {
    renderizarDashboard()

    expect(
      await screen.findByRole('heading', { name: 'Dashboard' }),
    ).toBeInTheDocument()
    expect(await screen.findByText('$4,031')).toBeInTheDocument()

    const metricas = await screen.findByLabelText('Métricas clave')
    expect(within(metricas).getAllByText('$5,350').length).toBeGreaterThan(0)
    expect(within(metricas).getAllByText('$1,319').length).toBeGreaterThan(0)

    expect(screen.getByText('Movimientos recientes')).toBeInTheDocument()
    expect(screen.getByText('Ingreso Uber')).toBeInTheDocument()
    expect(screen.getAllByText('Reserva fiscal').length).toBeGreaterThan(0)
  })

  it('muestra el estado vacío de movimientos recientes', async () => {
    server.use(
      http.get('*/api/movimientos', () => HttpResponse.json([])),
    )

    renderizarDashboard()

    expect(
      await screen.findByText('Sin movimientos todavía'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Registra un ingreso o gasto para comenzar.'),
    ).toBeInTheDocument()
  })

  it('muestra el estado de error y permite reintentar', async () => {
    server.use(
      http.get('*/api/resumen', () =>
        HttpResponse.json(
          { mensaje: 'Base de datos no disponible' },
          { status: 500 },
        ),
      ),
      http.get('*/api/movimientos', () =>
        HttpResponse.json(
          { mensaje: 'Base de datos no disponible' },
          { status: 500 },
        ),
      ),
    )

    renderizarDashboard()

    expect(
      await screen.findByText('No se pudo cargar la información'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Base de datos no disponible'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Reintentar cargar la información',
      }),
    ).toBeInTheDocument()
  })

  it('muestra la gráfica de ingresos vs gastos por mes', async () => {
    renderizarDashboard()

    expect(await screen.findByText('Ingresos vs gastos por mes')).toBeInTheDocument()
    expect(screen.getAllByText('Ingresos').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Gastos').length).toBeGreaterThan(0)
  })
})