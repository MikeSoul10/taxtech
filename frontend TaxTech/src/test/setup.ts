import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { setupServer } from 'msw/node'
import { handlers, reiniciarDatos } from './server'

export const server = setupServer(...handlers)

beforeAll(() => {
  reiniciarDatos()
  return server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  cleanup()
  server.resetHandlers()
  reiniciarDatos()
})

afterAll(() => server.close())