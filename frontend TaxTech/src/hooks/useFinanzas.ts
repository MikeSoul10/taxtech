import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  actualizarMovimiento,
  crearMovimiento,
  eliminarMovimiento,
  obtenerMovimientos,
  obtenerResumenFinanciero,
  reservarImpuestos,
} from '../api/taxtechApi'
import type { Movimiento } from '../types'

export const clavesConsulta = {
  resumen: ['resumen'] as const,
  movimientos: ['movimientos'] as const,
}

export function useResumenFinanciero() {
  return useQuery({
    queryKey: clavesConsulta.resumen,
    queryFn: obtenerResumenFinanciero,
  })
}

export function useMovimientos() {
  return useQuery({
    queryKey: clavesConsulta.movimientos,
    queryFn: obtenerMovimientos,
  })
}

function useInvalidarFinanzas() {
  const queryClient = useQueryClient()

  return () => {
    void queryClient.invalidateQueries({
      queryKey: clavesConsulta.movimientos,
    })
    void queryClient.invalidateQueries({ queryKey: clavesConsulta.resumen })
  }
}

export function useCrearMovimiento() {
  const invalidar = useInvalidarFinanzas()

  return useMutation({
    mutationFn: crearMovimiento,
    onSuccess: invalidar,
  })
}

export function useActualizarMovimiento() {
  const invalidar = useInvalidarFinanzas()

  return useMutation({
    mutationFn: ({
      id,
      datos,
    }: {
      id: string
      datos: Partial<Omit<Movimiento, 'id'>>
    }) => actualizarMovimiento(id, datos),
    onSuccess: invalidar,
  })
}

export function useEliminarMovimiento() {
  const invalidar = useInvalidarFinanzas()

  return useMutation({
    mutationFn: eliminarMovimiento,
    onSuccess: invalidar,
  })
}

export function useReservarImpuestos() {
  const invalidar = useInvalidarFinanzas()

  return useMutation({
    mutationFn: reservarImpuestos,
    onSuccess: invalidar,
  })
}