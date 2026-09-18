import { describe, expect, it } from 'vitest'
import { ErrorApi, mensajeDeError } from './client'

describe('ErrorApi', () => {
  it('expone estado y detalle de la petición', () => {
    const error = new ErrorApi('No encontrado', 404, { ok: false })

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('ErrorApi')
    expect(error.status).toBe(404)
    expect(error.detalle).toEqual({ ok: false })
  })

  it('conserva el mensaje en el stack', () => {
    const error = new ErrorApi('Servidor caído', null)

    expect(error.message).toBe('Servidor caído')
    expect(error.status).toBeNull()
  })
})

describe('mensajeDeError', () => {
  it('devuelve el mensaje de los errores nativos', () => {
    expect(mensajeDeError(new Error('Algo salió mal'))).toBe('Algo salió mal')
  })

  it('devuelve el mensaje de los errores de API', () => {
    expect(mensajeDeError(new ErrorApi('Token inválido', 401))).toBe(
      'Token inválido',
    )
  })

  it('usa un genérico para valores desconocidos', () => {
    expect(mensajeDeError('raw')).toBe('Ocurrió un error inesperado')
    expect(mensajeDeError(undefined)).toBe('Ocurrió un error inesperado')
  })
})