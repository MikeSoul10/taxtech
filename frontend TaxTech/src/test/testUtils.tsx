import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'

export function crearQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

interface OpcionesRenderConProveedores {
  rutaInicial?: string
}

export function renderConProveedores(
  ui: ReactNode,
  { rutaInicial = '/' }: OpcionesRenderConProveedores = {},
) {
  const queryClient = crearQueryClient()

  const resultado = render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[rutaInicial]}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )

  return { ...resultado, queryClient }
}