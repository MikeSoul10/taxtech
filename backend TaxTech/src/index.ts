import 'dotenv/config'
import { crearApp } from './app'
import { prisma } from './db'

const puerto = Number(process.env.PUERTO ?? 4000)

async function iniciar() {
  await prisma.$connect()

  const app = crearApp()

  app.listen(puerto, () => {
    console.log(`API de TaxTech escuchando en http://localhost:${puerto}`)
  })
}

iniciar().catch(async (error) => {
  console.error('Error al iniciar el servidor:', error)
  await prisma.$disconnect()
  process.exit(1)
})