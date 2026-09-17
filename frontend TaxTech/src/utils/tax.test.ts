import { describe, expect, it } from 'vitest'
import {
  calcularBaseGravable,
  calcularISR,
  estimarImpuesto,
  obtenerTramo,
  topeDeducciones,
} from './tax'

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

  it('suma cuota fija y excedente en un tramo medio', () => {
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

describe('obtenerTramo', () => {
  it('resuelve el tramo correcto según la base', () => {
    expect(obtenerTramo(1000)?.excedentePorCiento).toBe(1.92)
    expect(obtenerTramo(100_000)?.excedentePorCiento).toBe(10.88)
    expect(obtenerTramo(5_000_000)?.excedentePorCiento).toBe(35)
  })

  it('devuelve null sin base válida', () => {
    expect(obtenerTramo(0)).toBeNull()
    expect(obtenerTramo(Number.NaN)).toBeNull()
  })
})

describe('topeDeducciones', () => {
  it('devuelve 0 con entradas inválidas o no positivas', () => {
    expect(topeDeducciones(0, 500)).toBe(0)
    expect(topeDeducciones(1000, 0)).toBe(0)
    expect(topeDeducciones(Number.NaN, 500)).toBe(0)
    expect(topeDeducciones(-100, 50)).toBe(0)
  })

  it('respeta el tope del 10% de los ingresos', () => {
    expect(topeDeducciones(1000, 400)).toBe(100)
    expect(topeDeducciones(10_000, 500)).toBe(500)
  })

  it('nunca supera el monto de deducciones declarado', () => {
    expect(topeDeducciones(1000, 40)).toBe(40)
  })
})

describe('calcularBaseGravable', () => {
  it('resta el tope aplicado a los ingresos', () => {
    expect(calcularBaseGravable(1000, 400)).toBe(900)
    expect(calcularBaseGravable(1000, 40)).toBe(960)
  })

  it('nunca devuelve base negativa', () => {
    expect(calcularBaseGravable(0, 400)).toBe(0)
    expect(calcularBaseGravable(-100, 400)).toBe(0)
  })
})

describe('estimarImpuesto', () => {
  it('combina tope de deducciones y tarifa de la LISR', () => {
    expect(estimarImpuesto(1000, 400)).toBe(calcularISR(900))
    expect(estimarImpuesto(1000, 40)).toBe(calcularISR(960))
  })
})