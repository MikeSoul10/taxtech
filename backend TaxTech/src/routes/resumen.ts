import { Router } from 'express'
import { obtenerResumen } from '../services/resumenService'

const router = Router()

router.get('/', async (_req, res) => {
  res.json(await obtenerResumen())
})

export default router