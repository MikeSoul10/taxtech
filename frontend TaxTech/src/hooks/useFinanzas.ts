import { useQuery } from '@tanstack/react-query'
import {
  obtenerMovimientos,
  obtenerResumenFinanciero,
} from '../api/taxtechApi'

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