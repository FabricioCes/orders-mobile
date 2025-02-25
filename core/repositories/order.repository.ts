import AsyncStorage from '@react-native-async-storage/async-storage'
import { getBaseUrl } from '@/core/services/config'
import { ApiResponse, Order, OrderDetail } from '@/types/types'
import { Customer } from '@/types/customerTypes'
import { ActiveTable } from '@/types/tableTypes'
import { getToken } from '@/utils/tableUtils'

export class OrderApiRepository {
  private static async handleRequest<T> (
    endpoint: string,
    init?: RequestInit
  ): Promise<T> {
    let token: string | null = "";

    try{
      token = await getToken()
      if (!token) {
        throw new Error(
          'No se encontró un token válido. Inicie sesión nuevamente.'
        )
      }
    } catch(err) {
      console.log(err)
    }


    try {
      const headers: HeadersInit = {
        ...init?.headers,
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
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

  static async getOrder (orderId: number): Promise<Order> {
    try {
      const result = this.handleRequest<Order>(`Orden/${orderId}`)
      return result
    } catch (error) {
      throw new Error(
        'No se pudo obtener la orden: ' + (error as Error).message
      )
    }
  }

  static async getOrderIdByTable (zona: string, mesa: string): Promise<number> {
    return this.handleRequest<number>(`Orden/${zona.toUpperCase()}/${mesa}`)
  }

  static async getCustomerByOrderId (orderId: number): Promise<Customer> {
    return this.handleRequest<Customer>(`Orden/${orderId}/cliente`)
  }

  static async getActiveTables (): Promise<ActiveTable[]> {
    return this.handleRequest<ActiveTable[]>('Orden/activa')
  }

  static async getOrderDetails (orderId: number): Promise<OrderDetail[]> {
    const result = await this.handleRequest<OrderDetail[]>(
      `Orden/${orderId}/detalle`
    )
    return result
  }

  static async createOrder (order: Order): Promise<number> {
    console.log("Creacion Orden")
    if (!order.detalles?.length) {
      throw new Error('La orden debe contener al menos un detalle')
    }
    return this.handleRequest<number>('', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    })
  }

  static async updateOrder (order: Order): Promise<void> {
    console.log("ACTUALIZACION DE ORDEN",order)
    await this.handleRequest<void>('Orden', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    })
  }

  static async deleteOrderDetail (detailId: number): Promise<void> {
    await this.handleRequest<void>(`detalle/${detailId}`, { method: 'DELETE' })
  }
}
