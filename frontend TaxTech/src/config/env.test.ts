import { describe, expect, it, vi, afterEach } from 'vitest'
import { URL_API, URL_API_POR_DEFECTO, validarUrlApi } from './env'

describe('validarUrlApi', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('usa el valor por defecto cuando la variable no está definida', () => {
    expect(validarUrlApi(undefined)).toBe(URL_API_POR_DEFECTO)
  })

  it('usa el valor por defecto cuando la variable está vacía', () => {
    expect(validarUrlApi('   ')).toBe(URL_API_POR_DEFECTO)
  })

  it('acepta una URL http válida y la recorta', () => {
    expect(validarUrlApi('  http://localhost:4000/api  ')).toBe(
      'http://localhost:4000/api',
    )
  })

  it('acepta una URL https válida', () => {
    expect(validarUrlApi('https://api.taxtech.example/api')).toBe(
      'https://api.taxtech.example/api',
    )
  })

  it('rechaza un esquema no http(s) y avisa en desarrollo', () => {
    const avisos: string[] = []
    const spy = vi
      .spyOn(console, 'warn')
      .mockImplementation((mensaje) => avisos.push(String(mensaje)))

    expect(validarUrlApi('javascript:alert(1)')).toBe(URL_API_POR_DEFECTO)
    expect(spy).toHaveBeenCalledTimes(1)
    expect(avisos.join(' ')).toContain('VITE_API_BASE_URL')
  })

  it('rechaza un valor sin esquema como inválido', () => {
    expect(validarUrlApi('localhost:4000/api')).toBe(URL_API_POR_DEFECTO)
  })

  it('la constante pública exporta una URL http(s) siempre', () => {
    expect(URL_API.startsWith('http://') || URL_API.startsWith('https://')).toBe(
      true,
    )
  })
})