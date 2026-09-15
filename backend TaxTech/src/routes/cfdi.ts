import { Router } from 'express'
import type { ResultadoSincronizacion } from '../types'

const router = Router()

router.post('/sincronizar', (_req, res) => {
  const resultado: ResultadoSincronizacion = {
    comprobantesEncontrados: 24,
    mensaje: 'Sincronización completada (simulación)',
  }

  res.json(resultado)
})

export default router