import { URL_API } from '../config/env'

export { URL_API }

export const TIEMPO_ESPERA_MS = 10_000

export class ErrorApi extends Error {
  readonly status: number | null
  readonly detalle?: unknown

  constructor(mensaje: string, status: number | null, detalle?: unknown) {
    super(mensaje)
    this.name = 'ErrorApi'
    this.status = status
    this.detalle = detalle
  }
}

export function mensajeDeError(error: unknown): string {
  if (error instanceof Error) return error.message
  return 'Ocurrió un error inesperado'
}

interface OpcionesPeticion extends RequestInit {
  reintentos?: number
  timeoutMs?: number
}

interface CuerpoErrorApi {
  mensaje?: string
}

function esperar(ms: number): Promise<void> {
  return new Promise((resolver) => setTimeout(resolver, ms))
}

function crearErrorAbortado(): Error {
  const error = new Error('La petición fue cancelada')
  error.name = 'AbortError'
  return error
}

async function leerCuerpo(respuesta: Response): Promise<unknown> {
  const texto = await respuesta.text()
  if (!texto) return undefined

  try {
    return JSON.parse(texto)
  } catch {
    return texto
  }
}

async function ejecutarPeticion<T>(
  ruta: string,
  signalExterno: AbortSignal | null | undefined,
  timeoutMs: number,
  init: Omit<OpcionesPeticion, 'reintentos' | 'timeoutMs' | 'signal'>,
): Promise<T> {
  const controlador = new AbortController()
  let porTiempo = false

  const temporizador = setTimeout(() => {
    porTiempo = true
    controlador.abort()
  }, timeoutMs)

  const alAbortarExterno = () => controlador.abort()
  if (signalExterno?.aborted) {
    clearTimeout(temporizador)
    throw crearErrorAbortado()
  }
  signalExterno?.addEventListener('abort', alAbortarExterno)

  let respuesta: Response

  try {
    respuesta = await fetch(`${URL_API}${ruta}`, {
      ...init,
      method: init.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...init.headers,
      },
      signal: controlador.signal,
    })
  } catch (error) {
    if (porTiempo) {
      throw new ErrorApi(
        'Tiempo de espera agotado al contactar el servidor',
        null,
      )
    }

    if (controlador.signal.aborted) throw crearErrorAbortado()

    throw new ErrorApi(
      'No se pudo conectar con el servidor. Verifica que el backend esté en línea.',
      null,
      error,
    )
  } finally {
    clearTimeout(temporizador)
    signalExterno?.removeEventListener('abort', alAbortarExterno)
  }

  if (!respuesta.ok) {
    const cuerpo = (await leerCuerpo(respuesta)) as CuerpoErrorApi | undefined
    const mensaje =
      cuerpo?.mensaje ?? `Error ${respuesta.status} al consultar la API`

    throw new ErrorApi(mensaje, respuesta.status, cuerpo)
  }

  if (respuesta.status === 204) return undefined as T

  return (await leerCuerpo(respuesta)) as T
}

export async function peticion<T>(
  ruta: string,
  opciones: OpcionesPeticion = {},
): Promise<T> {
  const {
    reintentos = 1,
    timeoutMs = TIEMPO_ESPERA_MS,
    signal,
    ...init
  } = opciones

  let ultimoError: unknown = null

  for (let intento = 0; intento <= reintentos; intento++) {
    try {
      return await ejecutarPeticion<T>(ruta, signal, timeoutMs, init)
    } catch (error) {
      ultimoError = error

      if (error instanceof Error && error.name === 'AbortError') throw error

      const reintentable =
        intento < reintentos &&
        (error instanceof ErrorApi && error.status === null
          ? true
          : error instanceof ErrorApi && error.status !== null
            ? error.status >= 500
            : true)

      if (reintentable) {
        await esperar(250 * 2 ** intento)
        continue
      }

      throw error
    }
  }

  throw ultimoError
}