import { z } from 'zod'

const TIPOS = ['Ingreso', 'Gasto'] as const

export const crearMovimientoSchema = z.object({
  concepto: z.string().trim().min(1, 'El concepto es obligatorio').max(120),
  tipo: z.enum(TIPOS),
  monto: z.number().positive('El monto debe ser mayor a 0'),
  fecha: z
    .string()
    .refine(
      (valor) => !Number.isNaN(new Date(valor).getTime()),
      'La fecha no es válida',
    ),
  categoria: z.string().trim().min(1, 'La categoría es obligatoria').max(80),
  deducible: z.boolean().optional(),
})

export const actualizarMovimientoSchema = crearMovimientoSchema.partial()

export const pedirReservaSchema = z.object({
  cantidad: z.number().positive('La cantidad debe ser mayor a 0'),
})

export type CrearMovimiento = z.infer<typeof crearMovimientoSchema>
export type ActualizarMovimiento = z.infer<typeof actualizarMovimientoSchema>