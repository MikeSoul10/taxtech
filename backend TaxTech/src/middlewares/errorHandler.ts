import type { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'

export const errorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next,
) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      ok: false,
      mensaje: 'Datos inválidos',
      errores: error.issues.map((issue) => ({
        campo: issue.path.join('.') || '(raíz)',
        mensaje: issue.message,
      })),
    })
    return
  }

  console.error('Error no controlado:', error)
  res.status(500).json({
    ok: false,
    mensaje: 'Error interno del servidor',
  })
}