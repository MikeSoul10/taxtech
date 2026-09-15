interface IconoProps {
  className?: string
}

export function IconoIngresos({ className = 'h-6 w-6' }: IconoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 20h18" />
      <path d="M7 16l5-5 3 3 6-6" />
      <path d="M15 8h6v6" />
    </svg>
  )
}

export function IconoGastos({ className = 'h-6 w-6' }: IconoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 20h18" />
      <path d="M17 7l-5 5-3-3-6 6" />
      <path d="M9 16H3v-6" />
    </svg>
  )
}

export function IconoDeducibles({ className = 'h-6 w-6' }: IconoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <circle cx="7" cy="7" r="1.2" />
    </svg>
  )
}

export function IconoImpuesto({ className = 'h-6 w-6' }: IconoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M8 6h8" />
      <path d="M8 10h7M8 14h7M8 18h7" />
    </svg>
  )
}

export function IconoFlechaEsquina({ className = 'h-5 w-5' }: IconoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 17L17 7M8 7h9v9" />
    </svg>
  )
}

export function IconoFlecha({ className = 'h-5 w-5' }: IconoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export function IconoVistaPrevia({ className = 'h-5 w-5' }: IconoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export function IconoBanca({ className = 'h-6 w-6' }: IconoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 21h18" />
      <path d="M5 21V10" />
      <path d="M19 21V10" />
      <path d="M2 6l10-4 10 4" />
      <path d="M8 21v-7M12 21v-7M16 21v-7" />
    </svg>
  )
}