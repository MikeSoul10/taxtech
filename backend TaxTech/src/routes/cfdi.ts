import { Router } from 'express'
import type {
  ComprobanteCFDI,
  ResultadoImportacionCFDI,
  ResultadoSincronizacion,
} from '../types'
import { crearMovimientosMasivos } from '../services/movimientosService'

const router = Router()

const COMPROBANTES_SIMULADOS: ComprobanteCFDI[] = [
  {
    uuid: '4A1B8F3C-9E2D-4E1B-8A7C-3F2E1D0C9B8A',
    rfcEmisor: 'GOCM850412H84',
    nombreEmisor: 'GARCIA ORTIZ Y ASOCIADOS S.C.',
    rfcReceptor: 'XAXX010101000',
    nombreReceptor: 'MIKE SOUL TAXTECH CLIENT',
    concepto: 'Factura F-9082: Desarrollo de Software Web y API REST',
    tipo: 'Ingreso',
    subtotal: 18000.0,
    iva: 2880.0,
    total: 20880.0,
    fecha: '2026-09-05T10:30:00.000Z',
    categoria: 'Honorarios',
    deducible: false,
    estado: 'Vigente',
  },
  {
    uuid: '7F9E2D1C-8B4A-4E3D-9A2B-1C0D9E8F7A6B',
    rfcEmisor: 'AWS1503129A8',
    nombreEmisor: 'AMAZON WEB SERVICES MEXICO S.DE R.L. DE C.V.',
    rfcReceptor: 'XAXX010101000',
    nombreReceptor: 'MIKE SOUL TAXTECH CLIENT',
    concepto: 'Servicios de Servidores Cloud y Base de Datos (Septiembre 2026)',
    tipo: 'Gasto',
    subtotal: 2450.0,
    iva: 392.0,
    total: 2842.0,
    fecha: '2026-09-10T14:15:00.000Z',
    categoria: 'Software',
    deducible: true,
    estado: 'Vigente',
  },
  {
    uuid: '3B2A1C0D-9E8F-4A7B-8C9D-0E1F2A3B4C5D',
    rfcEmisor: 'OFF920415392',
    nombreEmisor: 'OFFICE DEPOT DE MEXICO S.A. DE C.V.',
    rfcReceptor: 'XAXX010101000',
    nombreReceptor: 'MIKE SOUL TAXTECH CLIENT',
    concepto: 'Silla Ergonómica Ejecutiva y Papelería de Oficina',
    tipo: 'Gasto',
    subtotal: 4200.0,
    iva: 672.0,
    total: 4872.0,
    fecha: '2026-09-12T11:00:00.000Z',
    categoria: 'Oficina',
    deducible: true,
    estado: 'Vigente',
  },
  {
    uuid: '9C8B7A6F-5E4D-4C3B-2A1F-0E9D8C7B6A5F',
    rfcEmisor: 'TEL970211N1A',
    nombreEmisor: 'TELÉFONOS DE MÉXICO S.A.B. DE C.V.',
    rfcReceptor: 'XAXX010101000',
    nombreReceptor: 'MIKE SOUL TAXTECH CLIENT',
    concepto: 'Paquete Negocio Fibra Óptica 500 Megas + Telefonía',
    tipo: 'Gasto',
    subtotal: 1284.48,
    iva: 205.52,
    total: 1490.0,
    fecha: '2026-09-14T09:20:00.000Z',
    categoria: 'Servicios',
    deducible: true,
    estado: 'Vigente',
  },
  {
    uuid: '1E2D3C4B-5A6F-7E8D-9C0B-1A2B3C4D5E6F',
    rfcEmisor: 'SPE941012921',
    nombreEmisor: 'SOLUCIONES DIGITALES PAYMENT SYSTEMS S.A.',
    rfcReceptor: 'XAXX010101000',
    nombreReceptor: 'MIKE SOUL TAXTECH CLIENT',
    concepto: 'Factura F-9145: Consultoría Técnica de Inteligencia Artificial',
    tipo: 'Ingreso',
    subtotal: 35000.0,
    iva: 5600.0,
    total: 40600.0,
    fecha: '2026-09-18T16:45:00.000Z',
    categoria: 'Ventas',
    deducible: false,
    estado: 'Vigente',
  },
  {
    uuid: '5F4E3D2C-1B0A-9F8E-7D6C-5B4A3F2E1D0C',
    rfcEmisor: 'GME0208151A4',
    nombreEmisor: 'GRUPO GASOLINERO DEL VALLE S.A. DE C.V.',
    rfcReceptor: 'XAXX010101000',
    nombreReceptor: 'MIKE SOUL TAXTECH CLIENT',
    concepto: 'Combustible Premium Magna para Vehículo Utilitario',
    tipo: 'Gasto',
    subtotal: 1034.48,
    iva: 165.52,
    total: 1200.0,
    fecha: '2026-09-20T18:10:00.000Z',
    categoria: 'Transporte',
    deducible: true,
    estado: 'Vigente',
  },
]

router.post('/sincronizar', (_req, res) => {
  const resultado: ResultadoSincronizacion = {
    comprobantesEncontrados: COMPROBANTES_SIMULADOS.length,
    mensaje: 'Sincronización completada con el Portal del SAT (simulación)',
  }

  res.json(resultado)
})

router.post('/consultar', (req, res) => {
  const { tipo, rfc } = req.body || {}

  let resultados = [...COMPROBANTES_SIMULADOS]

  if (tipo === 'Ingreso' || tipo === 'Emitidos') {
    resultados = resultados.filter((c) => c.tipo === 'Ingreso')
  } else if (tipo === 'Gasto' || tipo === 'Recibidos') {
    resultados = resultados.filter((c) => c.tipo === 'Gasto')
  }

  if (rfc && typeof rfc === 'string' && rfc.trim().length > 0) {
    const rfcL = rfc.trim().toUpperCase()
    resultados = resultados.map((c) => ({
      ...c,
      rfcReceptor: c.tipo === 'Ingreso' ? rfcL : c.rfcReceptor,
      rfcEmisor: c.tipo === 'Gasto' ? rfcL : c.rfcEmisor,
    }))
  }

  res.json({
    ok: true,
    totalEncontrados: resultados.length,
    comprobantes: resultados,
  })
})

router.post('/importar', async (req, res) => {
  try {
    const { comprobantes } = req.body as { comprobantes: ComprobanteCFDI[] }

    if (!Array.isArray(comprobantes) || comprobantes.length === 0) {
      res.status(400).json({
        ok: false,
        mensaje: 'No se enviaron comprobantes para importar',
        importados: 0,
        movimientos: [],
      })
      return
    }

    const entradas = comprobantes.map((cfdi) => ({
      concepto: `[CFDI SAT ${cfdi.uuid.slice(0, 8)}] ${cfdi.concepto}`,
      tipo: cfdi.tipo,
      monto: cfdi.total,
      fecha: cfdi.fecha,
      categoria: cfdi.categoria,
      deducible: cfdi.deducible,
    }))

    const creados = await crearMovimientosMasivos(entradas)

    const resultado: ResultadoImportacionCFDI = {
      ok: true,
      importados: creados.length,
      mensaje: `Se importaron con éxito ${creados.length} facturas del SAT a tu contabilidad.`,
      movimientos: creados,
    }

    res.json(resultado)
  } catch (error) {
    console.error('Error al importar facturas del SAT:', error)
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno al importar los comprobantes a la base de datos',
      importados: 0,
      movimientos: [],
    })
  }
})

export default router