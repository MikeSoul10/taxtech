export interface TramoISR {
  limiteInferior: number
  limiteSuperior: number | null
  cuotaFija: number
  excedentePorCiento: number
}

// Tarifa anual del ISR (LISR), 11 tramos. El "coeficiente" de cada tramo es
// excedentePorCiento (el % que se aplica al excedente). Tabla de referencia
// académica; parametrizable por año.
export const TARIFA_ISR_2026: TramoISR[] = [
  { limiteInferior: 0.01, limiteSuperior: 8_952.49, cuotaFija: 0, excedentePorCiento: 1.92 },
  { limiteInferior: 8_952.5, limiteSuperior: 75_984.55, cuotaFija: 171.88, excedentePorCiento: 6.4 },
  { limiteInferior: 75_984.56, limiteSuperior: 133_536.07, cuotaFija: 4_462.13, excedentePorCiento: 10.88 },
  { limiteInferior: 133_536.08, limiteSuperior: 155_229.8, cuotaFija: 10_722.51, excedentePorCiento: 16 },
  { limiteInferior: 155_229.81, limiteSuperior: 185_852.57, cuotaFija: 14_193.51, excedentePorCiento: 17.92 },
  { limiteInferior: 185_852.58, limiteSuperior: 374_837.89, cuotaFija: 19_682.64, excedentePorCiento: 21.36 },
  { limiteInferior: 374_837.9, limiteSuperior: 590_795.99, cuotaFija: 60_108.09, excedentePorCiento: 23.52 },
  { limiteInferior: 590_796.0, limiteSuperior: 1_127_926.85, cuotaFija: 110_889.89, excedentePorCiento: 30 },
  { limiteInferior: 1_127_926.86, limiteSuperior: 1_503_902.47, cuotaFija: 271_929.3, excedentePorCiento: 32 },
  { limiteInferior: 1_503_902.48, limiteSuperior: 4_511_707.38, cuotaFija: 392_441.56, excedentePorCiento: 34 },
  { limiteInferior: 4_511_707.39, limiteSuperior: null, cuotaFija: 1_416_150.26, excedentePorCiento: 35 },
]

// Las deducciones aplicables al cálculo de la base gravable se topan al 10%
// de los ingresos del periodo (art. LISR vigente).
export const PORCENTAJE_TOPE_DEDUCCIONES = 0.1

function redondear(valor: number): number {
  return Math.round(valor * 100) / 100
}

export function topeDeducciones(ingresos: number, deducibles: number): number {
  if (!Number.isFinite(ingresos) || !Number.isFinite(deducibles)) return 0
  if (ingresos <= 0 || deducibles <= 0) return 0

  return redondear(Math.min(deducibles, ingresos * PORCENTAJE_TOPE_DEDUCCIONES))
}

export function calcularBaseGravable(
  ingresos: number,
  deducibles: number,
): number {
  const base = ingresos - topeDeducciones(ingresos, deducibles)
  return base > 0 ? redondear(base) : 0
}

export function obtenerTramo(
  baseGravable: number,
): TramoISR | null {
  if (!Number.isFinite(baseGravable) || baseGravable <= 0) return null

  return (
    TARIFA_ISR_2026.find(
      (t) =>
        t.limiteInferior <= baseGravable &&
        (t.limiteSuperior === null || baseGravable <= t.limiteSuperior),
    ) ?? null
  )
}

export function calcularISR(baseGravable: number): number {
  const tramo = obtenerTramo(baseGravable)
  if (!tramo) return 0

  const impuesto =
    tramo.cuotaFija +
    ((baseGravable - tramo.limiteInferior) * tramo.excedentePorCiento) / 100

  return redondear(impuesto)
}

export function estimarImpuesto(
  ingresos: number,
  deducibles: number,
): number {
  return calcularISR(calcularBaseGravable(ingresos, deducibles))
}