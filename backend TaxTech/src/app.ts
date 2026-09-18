import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { errorHandler } from './middlewares/errorHandler'
import resumenRoutes from './routes/resumen'
import movimientosRoutes from './routes/movimientos'
import impuestosRoutes from './routes/impuestos'
import cfdiRoutes from './routes/cfdi'

export function crearApp() {
  const app = express()

  app.use(helmet())
  app.use(
    cors({
      origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    }),
  )
  app.use(express.json())

  app.get('/api/estado', (_req, res) => {
    res.json({ ok: true, mensaje: 'API de TaxTech operativa' })
  })

  app.use('/api/resumen', resumenRoutes)
  app.use('/api/movimientos', movimientosRoutes)
  app.use('/api/impuestos', impuestosRoutes)
  app.use('/api/cfdi', cfdiRoutes)

  app.use(errorHandler)

  return app
}