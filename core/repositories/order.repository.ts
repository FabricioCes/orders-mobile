import { getBaseUrl, handleUnauthorized } from '@/core/services/config'
import { ApiResponse, Order, OrderDetail, SaveOptions } from '@/types/types'
import { Customer } from '@/types/customerTypes'
import { ActiveTable } from '@/types/tableTypes'
import { getToken } from '@/utils/tableUtils'
import mapToGuardarOrdenRequest from '@/core/mappers/mappers'
export class OrderApiRepository {
  private static async handleRequest<T> (
    endpoint: string,
    init?: RequestInit
  ): Promise<T> {
    let token: string | null = ''

    try {
      token = await getToken()
      if (!token) {
        throw new Error('Token no válido')
      }
    } catch (err) {
      console.error('Error obteniendo token:', err)
      throw new Error('Error de autenticación')
    }

    const headers: HeadersInit = {
      ...init?.headers,
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
    const response = await fetch(`${await getBaseUrl()}/${endpoint}`, {
      ...init,
      headers
    })

    const data: ApiResponse<T> = await response.json()

    if (response.status === 401) {
      handleUnauthorized();
      throw new Error('Sesión expirada');
    }
    if (data.error) {
      throw new Error(data.mensaje || 'Error en la respuesta de la API', {
        cause: data.tipoError
      })
    }

    return data.resultado
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

  static async createOrder (
    order: Order,
    options: SaveOptions
  ): Promise<number> {
    if (order.detalles?.length === 0) {
      throw new Error('La orden debe contener al menos un detalle')
    }
    order.numeroOrden = 0

    const mappedOrder = mapToGuardarOrdenRequest(order, options)

    return this.handleRequest<number>('Orden', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mappedOrder)
    })
  }

  static async updateOrder (order: Order, options: SaveOptions): Promise<Order> {
    const mappedOrder = mapToGuardarOrdenRequest(order, options)

    const result = await this.handleRequest<Order>('Orden', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mappedOrder)
    })

    return result
  }

  static async deleteOrderDetail (detailId: number): Promise<void> {
    await this.handleRequest<void>(`Orden/detalle/${detailId}`, {
      method: 'DELETE'
    })
  }
}
