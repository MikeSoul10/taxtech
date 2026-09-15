import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function principal() {
  await prisma.reservaFiscal.deleteMany()
  await prisma.movimiento.deleteMany()

  await prisma.movimiento.createMany({
    data: [
      {
        id: '7f2c9a1e-3d4b-4f8e-9a1b-2c3d4e5f6a7b',
        concepto: 'Ingreso Uber',
        tipo: 'Ingreso',
        monto: 850,
        fecha: new Date('2026-09-10T12:00:00.000Z'),
        categoria: 'Plataformas digitales',
        deducible: false,
      },
      {
        id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
        concepto: 'Gasolina',
        tipo: 'Gasto',
        monto: 720,
        fecha: new Date('2026-09-08T12:00:00.000Z'),
        categoria: 'Transporte',
        deducible: true,
      },
      {
        id: '1e2f3a4b-5c6d-4e7f-8a9b-0c1d2e3f4a5b',
        concepto: 'Servicio de diseño',
        tipo: 'Ingreso',
        monto: 4500,
        fecha: new Date('2026-09-05T12:00:00.000Z'),
        categoria: 'Honorarios',
        deducible: false,
      },
      {
        id: '5a6b7c8d-9e0f-4a1b-2c3d-4e5f6a7b8c9d',
        concepto: 'Internet',
        tipo: 'Gasto',
        monto: 599,
        fecha: new Date('2026-09-03T12:00:00.000Z'),
        categoria: 'Servicios',
        deducible: true,
      },
    ],
  })

  await prisma.reservaFiscal.create({
    data: {
      cantidad: 3500,
      fecha: new Date('2026-09-01T12:00:00.000Z'),
    },
  })

  console.log('Seed completado: 4 movimientos y 1 reserva fiscal.')
}

principal()
  .finally(async () => {
    await prisma.$disconnect()
  })