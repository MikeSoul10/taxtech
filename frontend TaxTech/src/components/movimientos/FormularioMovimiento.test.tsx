import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FormularioMovimiento from './FormularioMovimiento'

const inicial = {
  concepto: '',
  tipo: 'Gasto' as const,
  monto: '',
  fecha: '2026-09-17',
  categoria: '',
  deducible: false,
}

describe('FormularioMovimiento', () => {
  it('llama onGuardar con los datos capturados', async () => {
    const usuario = userEvent.setup()
    const alGuardar = vi.fn()

    render(
      <FormularioMovimiento
        inicial={inicial}
        categorias={['Transporte']}
        guardando={false}
        notaAccion="Crear movimiento"
        onCancelar={() => {}}
        onGuardar={alGuardar}
      />,
    )

    await usuario.type(screen.getByLabelText('Concepto'), 'Gasolina')
    await usuario.selectOptions(screen.getByLabelText('Tipo'), 'Ingreso')
    await usuario.type(screen.getByLabelText('Monto (MXN)'), '850')
    await usuario.type(screen.getByLabelText('Categoría'), 'Transporte')
    await usuario.click(
      screen.getByRole('button', { name: 'Crear movimiento' }),
    )

    expect(alGuardar).toHaveBeenCalledWith({
      concepto: 'Gasolina',
      tipo: 'Ingreso',
      monto: '850',
      fecha: '2026-09-17',
      categoria: 'Transporte',
      deducible: false,
    })
  })

  it('cambiar el tipo a Ingreso desactiva el campo Deducible', async () => {
    const usuario = userEvent.setup()

    render(
      <FormularioMovimiento
        inicial={inicial}
        categorias={[]}
        guardando={false}
        notaAccion="Guardar cambios"
        onCancelar={() => {}}
        onGuardar={() => {}}
      />,
    )

    const deducible = screen.getByLabelText(/Deducible/) as HTMLInputElement
    expect(deducible).toBeEnabled()

    await usuario.selectOptions(screen.getByLabelText('Tipo'), 'Ingreso')

    expect(screen.getByLabelText(/Deducible/)).toBeDisabled()
  })

  it('no llama onGuardar si faltan campos requeridos', async () => {
    const usuario = userEvent.setup()
    const alGuardar = vi.fn()

    render(
      <FormularioMovimiento
        inicial={inicial}
        categorias={[]}
        guardando={false}
        notaAccion="Crear movimiento"
        onCancelar={() => {}}
        onGuardar={alGuardar}
      />,
    )

    await usuario.type(screen.getByLabelText('Monto (MXN)'), '500')
    await usuario.click(
      screen.getByRole('button', { name: 'Crear movimiento' }),
    )

    expect(alGuardar).not.toHaveBeenCalled()
  })

  it('muestra "Guardando..." mientras está pendiente la petición', () => {
    render(
      <FormularioMovimiento
        inicial={inicial}
        categorias={[]}
        guardando
        notaAccion="Guardar cambios"
        onCancelar={() => {}}
        onGuardar={() => {}}
      />,
    )

    const boton = screen.getByRole('button', { name: 'Guardando...' })
    expect(boton).toBeDisabled()
    expect(within(boton).getByText('Guardando...')).toBeInTheDocument()
  })
})