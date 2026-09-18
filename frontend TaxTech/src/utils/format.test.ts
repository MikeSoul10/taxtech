import { describe, expect, it } from 'vitest'
import {
  formatearFechaLarga,
  formatearFecha,
  formatearMoneda,
  formatearPorcentaje,
} from './format'

describe('formatearMoneda', () => {
  it('formatea cifras positivas y negativas en MXN es-MX', () => {
    expect(formatearMoneda(1234.56)).toBe('$1,234.56')
    expect(formatearMoneda(-50.5)).toBe('-$50.5')
    expect(formatearMoneda(0)).toBe('$0')
  })

  it('ignora valores nulos, indefinidos o inválidos', () => {
    expect(formatearMoneda()).toBe('$0')
    expect(formatearMoneda(null)).toBe('$0')
    expect(formatearMoneda(Number.NaN)).toBe('$0')
  })
})

describe('formatearFecha', () => {
  it('formatea fechas ISO (YYYY-MM-DD) y Date en formato corto es-MX', () => {
    expect(formatearFecha('2026-09-10')).toBe('10 sep 2026')
    expect(formatearFecha(new Date(Date.UTC(2026, 8, 10)))).toBe('10 sep 2026')
  })

  it('devuelve "—" ante valores ausentes o fechas inválidas', () => {
    expect(formatearFecha()).toBe('—')
    expect(formatearFecha(null)).toBe('—')
    expect(formatearFecha('no soy una fecha')).toBe('—')
    expect(formatearFecha(new Date(Number.NaN))).toBe('—')
  })
})

describe('formatearFechaLarga', () => {
  it('formatea fechas en formato largo es-MX', () => {
    expect(formatearFechaLarga('2026-09-10')).toBe('10 de septiembre de 2026')
  })

  it('devuelve "—" ante valores ausentes o inválidos', () => {
    expect(formatearFechaLarga()).toBe('—')
    expect(formatearFechaLarga('fecha inválida')).toBe('—')
  })
})

describe('formatearPorcentaje', () => {
  it('recibe un valor 0-100 y lo muestra como porcentaje', () => {
    expect(formatearPorcentaje(25)).toBe('25%')
    expect(formatearPorcentaje(33.33)).toBe('33.3%')
    expect(formatearPorcentaje(0)).toBe('0%')
  })

  it('devuelve "0%" ante valores nulos o inválidos', () => {
    expect(formatearPorcentaje()).toBe('0%')
    expect(formatearPorcentaje(null)).toBe('0%')
  })
})