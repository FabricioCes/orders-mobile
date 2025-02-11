// src/core/repositories/CustomerApiRepository.ts
import { getBaseUrl } from '@/core/services/config'
import { Customer } from '@/types/customerTypes'
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
      return data.resultado
    } catch (error) {
      console.log('Error in handleRequest:', error)
      throw new Error(
        'Error al procesar la solicitud: ' + (error as Error).message
      )
    }
  }

  // Obtiene un cliente por su ID
  static async getCustomer (customerId: number): Promise<Customer> {
    try {
      const result = await this.handleRequest<Customer>(`Cliente/${customerId}`)
      return result
    } catch (error) {
      throw new Error(
        'No se pudo obtener el cliente: ' + (error as Error).message
      )
    }
  }

  static async getCustomers (
    page: number = 1,
    pageSize: number = 100,
    signal?: AbortSignal
  ): Promise<Customer[]> {
    try {
      const endpoint = `cliente?pagina=${page}&tamanoPagina=${pageSize}`
      const result = await this.handleRequest<Customer[]>(endpoint, { signal })
      return result
    } catch (error) {
      throw new Error(
        'No se pudo obtener los clientes: ' + (error as Error).message
      )
    }
  }
}
