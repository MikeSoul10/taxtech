import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'
import { crearApp } from './app'
import { prisma } from './db'

const app = crearApp()

// Smoke tests contra la BD local. Antes de correr la suite se normaliza el estado.
beforeAll(async () => {
  await prisma.reservaFiscal.deleteMany()
  await prisma.movimiento.deleteMany()

  await prisma.movimiento.create({
    data: {
      concepto: 'Ingreso prueba',
      tipo: 'Ingreso',
      monto: 1000,
      fecha: new Date('2026-09-01T12:00:00.000Z'),
      categoria: 'Prueba',
      deducible: false,
    },
  })

  await prisma.movimiento.create({
    data: {
      concepto: 'Gasto prueba',
      tipo: 'Gasto',
      monto: 400,
      fecha: new Date('2026-09-02T12:00:00.000Z'),
      categoria: 'Prueba',
      deducible: true,
    },
  })
})

describe('GET /api', () => {
  it('responde en /api/estado', async () => {
    const res = await request(app).get('/api/estado').expect(200)
    expect(res.body.ok).toBe(true)
  })

  it('envía cabeceras de seguridad', async () => {
    const res = await request(app).get('/api/estado')
    expect(res.headers['x-content-type-options']).toBe('nosniff')
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN')
    expect(res.headers['referrer-policy']).toBeDefined()
    expect(res.headers['x-powered-by']).toBeUndefined()
  })

  it('lista movimientos', async () => {
    const res = await request(app).get('/api/movimientos').expect(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThanOrEqual(2)
  })

  it('calcula el resumen desde los movimientos', async () => {
    const res = await request(app).get('/api/resumen').expect(200)
    expect(res.body.ingresos).toBe(1000)
    expect(res.body.gastos).toBe(400)
    expect(res.body.deducibles).toBe(400)
    expect(res.body.impuestoEstimado).toBeGreaterThan(0)
  })
})

describe('POST /api/movimientos', () => {
  it('rechaza datos inválidos con 400', async () => {
    const res = await request(app)
      .post('/api/movimientos')
      .send({
        concepto: '',
        tipo: 'Ingreso',
        monto: 10,
        fecha: '2026-09-03',
        categoria: 'X',
      })
      .expect(400)

    expect(res.body.ok).toBe(false)
  })

  it('crea un movimiento nuevo (201)', async () => {
    const res = await request(app)
      .post('/api/movimientos')
      .send({
        concepto: 'Nuevo',
        tipo: 'Gasto',
        monto: 250,
        fecha: '2026-09-04',
        categoria: 'Varios',
        deducible: false,
      })
      .expect(201)

    expect(res.body.concepto).toBe('Nuevo')
    expect(res.body.monto).toBe(250)
  })
})

describe('PATCH /api/movimientos/:id', () => {
  it('actualiza un movimiento y devuelve 404 si no existe', async () => {
    const lista = await request(app).get('/api/movimientos')
    const objetivo = lista.body.find(
      (movimiento: { concepto: string }) => movimiento.concepto === 'Nuevo',
    )

    const res = await request(app)
      .patch(`/api/movimientos/${objetivo.id}`)
      .send({ deducible: true })
      .expect(200)

    expect(res.body.deducible).toBe(true)

    await request(app)
      .patch('/api/movimientos/id-inexistente')
      .send({ deducible: true })
      .expect(404)
  })
})

describe('DELETE /api/movimientos/:id', () => {
  it('elimina un movimiento y luego responde 404', async () => {
    const lista = await request(app).get('/api/movimientos')
    const objetivo = lista.body.find(
      (movimiento: { concepto: string }) => movimiento.concepto === 'Nuevo',
    )

    await request(app).delete(`/api/movimientos/${objetivo.id}`).expect(204)
    await request(app).delete(`/api/movimientos/${objetivo.id}`).expect(404)
  })
})

describe('POST /api/impuestos y /api/cfdi', () => {
  it('reserva impuestos y refleja el resumen', async () => {
    const antes = await request(app).get('/api/resumen')

    const res = await request(app)
      .post('/api/impuestos/reservar')
      .send({ cantidad: 500 })
      .expect(201)

    expect(res.body.ok).toBe(true)
    expect(res.body.cantidadReservada).toBe(500)

    const despues = await request(app).get('/api/resumen')
    expect(despues.body.reservaFiscal).toBe(antes.body.reservaFiscal + 500)
  })

  it('sincroniza CFDI (simulación)', async () => {
    const res = await request(app).post('/api/cfdi/sincronizar').expect(200)
    expect(res.body.comprobantesEncontrados).toBeGreaterThan(0)
  })
})