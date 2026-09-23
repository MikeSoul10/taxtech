import { Router } from 'express'
import {
  actualizarMovimientoSchema,
  crearMovimientoSchema,
} from '../schemas/validators'
import {
  actualizarMovimiento,
  crearMovimiento,
  eliminarMovimiento,
  eliminarMovimientosMasivo,
  listarMovimientos,
} from '../services/movimientosService'

const router = Router()

router.get('/', async (_req, res) => {
  res.json(await listarMovimientos())
})

router.post('/', async (req, res) => {
  const datos = crearMovimientoSchema.parse(req.body)
  res.status(201).json(await crearMovimiento(datos))
})

router.delete('/', async (req, res) => {
  const tipo = req.query.tipo as 'todos' | 'Ingreso' | 'Gasto' | undefined
  const resultado = await eliminarMovimientosMasivo(tipo)
  res.json({ ok: true, ...resultado })
})

router.patch('/:id', async (req, res) => {
  const datos = actualizarMovimientoSchema.parse(req.body)

  const movimiento = await actualizarMovimiento(req.params.id, datos)

  if (!movimiento) {
    res.status(404).json({ ok: false, mensaje: 'Movimiento no encontrado' })
    return
  }

  res.json(movimiento)
})

router.delete('/:id', async (req, res) => {
  const eliminado = await eliminarMovimiento(req.params.id)

  if (!eliminado) {
    res.status(404).json({ ok: false, mensaje: 'Movimiento no encontrado' })
    return
  }

  res.status(204).end()
})

export default router