import { Router } from 'express'
import { pedirReservaSchema } from '../schemas/validators'
import {
  reiniciarReservaFiscal,
  reservarImpuestos,
} from '../services/impuestosService'

const router = Router()

router.post('/reservar', async (req, res) => {
  const { cantidad } = pedirReservaSchema.parse(req.body)
  res.status(201).json(await reservarImpuestos(cantidad))
})

router.post('/reiniciar', async (_req, res) => {
  res.json(await reiniciarReservaFiscal())
})

export default router