import { Alert } from 'react-native'

export class ZonaService {
  static async fetchZonasMesas (
    apiUrl: string,
    token: string
  ): Promise<Record<string, number>> {
    try {
      const response = await fetch(`${apiUrl}/Parametro/cantidad/mesas`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data = await response.json()
      return data.resultado || {}
    } catch (error) {
      console.log('Error obteniendo zonas:', error)
      Alert.alert('Error', 'No se pudieron obtener las zonas y mesas')
      return {}
    }
  }
}
