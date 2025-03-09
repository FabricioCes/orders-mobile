import { useSettings } from '@/core/context/SettingsContext'
import { useCustomer } from '@/core/context/CustomerContext'
import { Order, SaveOptions } from '@/types/types'
import { Alert } from 'react-native'
import { ModoImpresion } from '@/types/enums'

export const useOrderUpdater = () => {
  const { userName } = useSettings() // Usamos userName como idUsuario
  const { state: customerState } = useCustomer()

  /**
   * Actualiza la orden con los datos actuales de usuario, cliente y modo de impresión.
   * @param order Orden a actualizar.
   * @param printOption Opción de impresión: 'ninguno' | 'parcial' | 'completo'
   * @returns Orden actualizada.
   */
  const getSaveOptions = async (
    order: Order
  ): Promise<SaveOptions> => {
    let printOption: { imprimir: boolean; modoImpresion: ModoImpresion } = { imprimir: false, modoImpresion: ModoImpresion.Completa }
    if(order.esTemporal){
      printOption = await confirmPrintOptions()
    }else {
      const result = await confirmPrintOptionsWithChange()
      printOption = { imprimir: result.imprimir, modoImpresion: result.modoImpresion || ModoImpresion.Completa }
    }
    return {
      idUsuario: userName,
      nombreCliente: customerState.selectedCustomer?.nombre || order.nombreCliente || '',
      idCliente:
        customerState.selectedCustomer?.identificacion || order.idCliente || 0,
      imprimir: printOption.imprimir,
      modoImpresion: printOption.modoImpresion
    }
  }

  return { getSaveOptions }
}
const confirmPrintOptions = (): Promise<{
  imprimir: boolean
  modoImpresion: ModoImpresion
}> => {
  return new Promise(resolve => {
    Alert.alert(
      'Impresión',
      '¿Deseas imprimir la orden?',
      [
        {
          text: 'No imprimir',
          onPress: () => resolve({ imprimir: false, modoImpresion: ModoImpresion.Completa })
        },
        {
          text: 'Imprimir',
          onPress: () => resolve({ imprimir: true, modoImpresion: ModoImpresion.Completa })
        }
      ],
      { cancelable: false }
    )
  })
}
const confirmPrintOptionsWithChange = (): Promise<{
  imprimir: boolean
  modoImpresion?: ModoImpresion
}> => {
  return new Promise(resolve => {
    Alert.alert(
      'Impresión',
      '¿Deseas imprimir la orden?',
      [
        {
          text: 'No imprimir',
          onPress: () => resolve({ imprimir: false })
        },
        {
          text: 'Imprimir diferencias',
          onPress: () => resolve({ imprimir: true, modoImpresion: ModoImpresion.Parcial })
        },
        {
          text: 'Imprimir todos',
          onPress: () => resolve({ imprimir: true, modoImpresion: ModoImpresion.Completa })
        }
      ],
      { cancelable: false }
    )
  })
}
