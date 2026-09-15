interface TramoISR {
  limiteInferior: number
  limiteSuperior: number | null
  cuotaFija: number
  excedentePorCiento: number
}

// Tarifa anual del ISR (LISR). NOTA: tabla de referencia académica; verificar
// el valor vigente antes de usarse con datos reales.
const TARIFA_ISR_2026: TramoISR[] = [
  { limiteInferior: 0.01, limiteSuperior: 8_952.49, cuotaFija: 0, excedentePorCiento: 1.92 },
  { limiteInferior: 8_952.5, limiteSuperior: 75_984.55, cuotaFija: 171.88, excedentePorCiento: 6.40 },
  { limiteInferior: 75_984.56, limiteSuperior: 133_536.07, cuotaFija: 4_462.13, excedentePorCiento: 10.88 },
  { limiteInferior: 133_536.08, limiteSuperior: 155_229.8, cuotaFija: 10_722.51, excedentePorCiento: 16.00 },
  { limiteInferior: 155_229.81, limiteSuperior: 185_852.57, cuotaFija: 14_193.51, excedentePorCiento: 17.92 },
  { limiteInferior: 185_852.58, limiteSuperior: 374_837.89, cuotaFija: 19_682.64, excedentePorCiento: 21.36 },
  { limiteInferior: 374_837.9, limiteSuperior: 590_795.99, cuotaFija: 60_108.09, excedentePorCiento: 23.52 },
  { limiteInferior: 590_796.0, limiteSuperior: 1_127_926.85, cuotaFija: 110_889.89, excedentePorCiento: 30.00 },
  { limiteInferior: 1_127_926.86, limiteSuperior: 1_503_902.47, cuotaFija: 271_929.3, excedentePorCiento: 32.00 },
  { limiteInferior: 1_503_902.48, limiteSuperior: 4_511_707.38, cuotaFija: 392_441.56, excedentePorCiento: 34.00 },
  { limiteInferior: 4_511_707.39, limiteSuperior: null, cuotaFija: 1_416_150.26, excedentePorCiento: 35.00 },
]

export function calcularISR(baseGravable: number): number {
  if (!Number.isFinite(baseGravable) || baseGravable <= 0) return 0

  const tramo = TARIFA_ISR_2026.find(
    (t) =>
      t.limiteInferior <= baseGravable &&
      (t.limiteSuperior === null || baseGravable <= t.limiteSuperior),
  )

  if (!tramo) return 0

  const impuesto =
    tramo.cuotaFija +
    ((baseGravable - tramo.limiteInferior) * tramo.excedentePorCiento) / 100

  return Math.round(impuesto * 100) / 100
}