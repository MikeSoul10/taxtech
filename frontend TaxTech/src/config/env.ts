export const URL_API_POR_DEFECTO = 'http://localhost:4000/api'

function esUrlHttp(valor: string): boolean {
  try {
    const url = new URL(valor)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function validarUrlApi(variable: string | undefined): string {
  const url = variable?.trim()

  if (!url) return URL_API_POR_DEFECTO
  if (esUrlHttp(url)) return url

  if (import.meta.env.DEV) {
    console.warn(
      `[env] VITE_API_BASE_URL no es una URL http(s) válida: "${url}". Se usará "${URL_API_POR_DEFECTO}".`,
    )
  }

  return URL_API_POR_DEFECTO
}

export const URL_API = validarUrlApi(
  import.meta.env.VITE_API_BASE_URL as string | undefined,
)