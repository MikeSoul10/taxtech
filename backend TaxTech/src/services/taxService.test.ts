import { describe, expect, it } from 'vitest'
import { calcularISR } from './taxService'

describe('calcularISR', () => {
  it('devuelve 0 si la base es 0 o negativa', () => {
    expect(calcularISR(0)).toBe(0)
    expect(calcularISR(-500)).toBe(0)
    expect(calcularISR(Number.NaN)).toBe(0)
  })

  it('aplica el primer tramo (tasa 1.92%)', () => {
    const base = 4031
    const esperado = Math.round(base * 0.0192 * 100) / 100
    expect(calcularISR(base)).toBe(esperado)
  })

  it('suma coquota fija y excedente en un tramo medio', () => {
    const base = 100_000
    const resultado = calcularISR(base)
    expect(resultado).toBeGreaterThan(4_462.13)
    expect(resultado).toBeLessThan(10_722.51)
  })

  it('aplica el tramo superior (tasa 35%)', () => {
    const base = 5_000_000
    const esperado =
      1_416_150.26 + (base - 4_511_707.38) * 0.35
    expect(calcularISR(base)).toBeCloseTo(esperado, 1)
  })
})