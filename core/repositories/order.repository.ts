import AsyncStorage from '@react-native-async-storage/async-storage'
import { getBaseUrl } from '@/core/services/config'
import { ApiResponse, Order, OrderDetail } from '@/types/types'
import { Client } from '@/types/clientTypes'
import { ActiveTable } from '@/types/tableTypes'
import { getToken } from '@/utils/tableUtils'

export class OrderApiRepository {
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

  static async getOrder (orderId: number): Promise<Order> {
    try {
      const result = this.handleRequest<Order>(`Orden/${orderId}`)
      console.log('orderid', result)
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

  static async getClientByOrderId (orderId: number): Promise<Client> {
    return this.handleRequest<Client>(`Orden/${orderId}/cliente`)
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

  static async createOrder (request: Order): Promise<number> {
    if (!request.detalles?.length) {
      throw new Error('La orden debe contener al menos un detalle')
    }
    return this.handleRequest<number>('', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    })
  }

  static async updateOrder (request: Order): Promise<void> {
    await this.handleRequest<void>('', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    })
  }

  static async deleteOrderDetail (detailId: number): Promise<void> {
    await this.handleRequest<void>(`detalle/${detailId}`, { method: 'DELETE' })
  }
}

export class OrderCacheRepository {
  static async getCachedOrder (orderId: number): Promise<Order | null> {
    try {
      const cachedOrder = await AsyncStorage.getItem(`order_${orderId}`)
      return cachedOrder ? JSON.parse(cachedOrder) : null
    } catch (error) {
      console.error('Error loading cached order:', error)
      return null
    }
  }

  static async cacheOrder (orderId: number, order: Order): Promise<void> {
    await AsyncStorage.setItem(`order_${orderId}`, JSON.stringify(order))
  }

  static async getCachedDetails (orderId: number): Promise<OrderDetail[]> {
    try {
      const cachedDetails = await AsyncStorage.getItem(
        `orderDetails_${orderId}`
      )
      return cachedDetails ? JSON.parse(cachedDetails) : []
    } catch (error) {
      console.error('Error loading cached details:', error)
      return []
    }
  }

  static async cacheDetails (
    orderId: number,
    details: OrderDetail[]
  ): Promise<void> {
    await AsyncStorage.setItem(
      `orderDetails_${orderId}`,
      JSON.stringify(details)
    )
  }

  static async clearOrderCache (orderId: number): Promise<void> {
    await Promise.all([
      AsyncStorage.removeItem(`order_${orderId}`),
      AsyncStorage.removeItem(`orderDetails_${orderId}`)
    ])
  }

  static async cacheOrders (orders: Order[]): Promise<void> {
    try {
      const ordersJson = JSON.stringify(orders)

      await AsyncStorage.setItem('cached_orders', ordersJson)

      console.log('Órdenes almacenadas en caché correctamente.')
    } catch (error) {
      console.error('Error al almacenar las órdenes en caché:', error)
      throw new Error('No se pudieron almacenar las órdenes en caché.')
    }
  }

  static async getCachedOrders (): Promise<Order[]> {
    try {
      const cachedOrders = await AsyncStorage.getItem('cached_orders')

      if (!cachedOrders) {
        return []
      }

      const orders: Order[] = JSON.parse(cachedOrders)

      return orders
    } catch (error) {
      console.error('Error al cargar las órdenes almacenadas:', error)
      return []
    }
  }
  static async clearAllCachedOrders (): Promise<void> {
    try {
      await AsyncStorage.removeItem('cached_orders')

      console.log('Todas las órdenes almacenadas han sido eliminadas.')
    } catch (error) {
      console.error('Error al limpiar las órdenes almacenadas:', error)
      throw new Error('No se pudieron limpiar las órdenes almacenadas.')
    }
  }
}
