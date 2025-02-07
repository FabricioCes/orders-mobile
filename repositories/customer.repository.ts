import { getBaseUrl } from '@/services/config'
import { Client } from '@/types/clientTypes'
import { ApiResponse } from '@/types/types'
import { getToken } from '@/utils/tableUtils'

export class CustomerApiRepository {
  private static async handleRequest<T> (
    endpoint: string,
    init?: RequestInit
  ): Promise<T> {
    const token = await getToken()

    if (!token) {
      throw new Error(
        'No se encontró un token válido. Inicie sesión nuevamente.'
      )
    }

    const headers = {
      ...init?.headers,
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
   console.log(`${await getBaseUrl()}/${endpoint}`)
    try {
      const response = await fetch(`${await getBaseUrl()}/${endpoint}`, {
        ...init,
        headers
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ApiResponse<T> = await response.json()
      if (data.error) {
        throw new Error(data.mensaje || 'Error en la respuesta de la API')
      }
      console.log(data)
      return data.resultado
    } catch (error) {
      console.log('Error in handleRequest:', error)
      throw new Error(
        'Error al procesar la solicitud: ' + (error as Error).message
      )
    }
  }

  static async getCustomer (customerId: number): Promise<Client> {
    try {
        console.log("repositorio", customerId)
      const result = await this.handleRequest<Client>(`Cliente/${customerId}`)
      console.log(result)
      return result
    } catch (error) {
      throw new Error(
        'No se pudo obtener los clientes: ' + (error as Error).message
      )
    }
  }
}
