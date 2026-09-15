import { Router } from 'express'
import { pedirReservaSchema } from '../schemas/validators'
import { reservarImpuestos } from '../services/impuestosService'

const router = Router()

router.post('/reservar', async (req, res) => {
  const { cantidad } = pedirReservaSchema.parse(req.body)
  res.status(201).json(await reservarImpuestos(cantidad))
})

export default router