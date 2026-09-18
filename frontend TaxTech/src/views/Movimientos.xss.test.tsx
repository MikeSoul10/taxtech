import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import Movimientos from './Movimientos'
import { renderConProveedores } from '../test/testUtils'
import { movimientosIniciales, reiniciarDatos } from '../test/server'
import type { Movimiento } from '../types'

const EXPLOIT =
  "<img src=x onerror=\"document.title='XSS-DETECTADO'\"><script>document.title='XSS-DETECTADO'</script>"

const CATEGORIA_EXPLOIT = "<svg onload=\"document.title='XSS-DETECTADO'\">"

function renderConDatoMalicioso() {
  const movimientos: Movimiento[] = [
    ...movimientosIniciales,
    {
      id: 'xss-1',
      concepto: EXPLOIT,
      tipo: 'Gasto',
      monto: 1,
      fecha: '2026-09-12',
      categoria: CATEGORIA_EXPLOIT,
      deducible: false,
    },
  ]

  reiniciarDatos({ movimientos })

  return renderConProveedores(<Movimientos />, {
    rutaInicial: '/movimientos',
  })
}

describe('sanitización de datos del usuario (XSS)', () => {
  it('renderiza un concepto malicioso como texto literal sin ejecutarlo', async () => {
    const { container } = renderConDatoMalicioso()

    const nodo = await screen.findByText(EXPLOIT)
    expect(nodo).toBeInTheDocument()
    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('script')).toBeNull()
    expect(document.title).not.toBe('XSS-DETECTADO')
  })

  it('no monta etiquetas HTML dentro de la categoría maliciosa', async () => {
    const { container } = renderConDatoMalicioso()

    await screen.findByText(EXPLOIT)
    expect(container.textContent).toContain(CATEGORIA_EXPLOIT)
    expect(container.querySelector('svg[onload]')).toBeNull()
    expect(document.title).not.toBe('XSS-DETECTADO')
  })
})