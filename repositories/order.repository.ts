import AsyncStorage from '@react-native-async-storage/async-storage'
import { getBaseUrl } from '@/services/config'
import { ApiResponse, Order, OrderDetail } from '@/types/types'
import { Client } from '@/types/clientTypes'

export class OrderApiRepository {
  private static async handleRequest<T> (
    endpoint: string,
    init?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${getBaseUrl()}/${endpoint}`, init)
    const data: ApiResponse<T> = await response.json()

    if (!response.ok || data.Error) {
      throw new Error(data.Mensaje || `HTTP error! status: ${response.status}`)
    }

    return data.Resultado
  }

  static async getOrder (orderId: number): Promise<Order> {
    return this.handleRequest<Order>(`${orderId}`)
  }

  static async getOrderIdByTable (zona: string, mesa: string): Promise<number> {
    return this.handleRequest<number>(`${zona.toUpperCase()}/${mesa}`)
  }

  static async getClientByOrderId (orderId: number): Promise<Client> {
    return this.handleRequest<Client>(`${orderId}/cliente`)
  }

  static async getActiveTables (): Promise<Order[]> {
    return this.handleRequest<Order[]>('activa')
  }

  static async getOrderDetails (orderId: number): Promise<OrderDetail[]> {
    return this.handleRequest<OrderDetail[]>(`${orderId}/detalle`)
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
      // Convertir la lista de órdenes a una cadena JSON
      const ordersJson = JSON.stringify(orders)

      // Almacenar las órdenes en AsyncStorage con una clave única
      await AsyncStorage.setItem('cached_orders', ordersJson)

      console.log('Órdenes almacenadas en caché correctamente.')
    } catch (error) {
      console.error('Error al almacenar las órdenes en caché:', error)
      throw new Error('No se pudieron almacenar las órdenes en caché.')
    }
  }

  static async getCachedOrders (): Promise<Order[]> {
    try {
      // Obtener las órdenes almacenadas en AsyncStorage
      const cachedOrders = await AsyncStorage.getItem('cached_orders')

      // Si no hay órdenes almacenadas, devolver un array vacío
      if (!cachedOrders) {
        return []
      }

      // Parsear las órdenes desde JSON a un array de objetos Order
      const orders: Order[] = JSON.parse(cachedOrders)

      return orders
    } catch (error) {
      console.error('Error al cargar las órdenes almacenadas:', error)
      return []
    }
  }
  static async clearAllCachedOrders (): Promise<void> {
    try {
      // Eliminar la clave 'cached_orders' de AsyncStorage
      await AsyncStorage.removeItem('cached_orders')

      console.log('Todas las órdenes almacenadas han sido eliminadas.')
    } catch (error) {
      console.error('Error al limpiar las órdenes almacenadas:', error)
      throw new Error('No se pudieron limpiar las órdenes almacenadas.')
    }
  }
}
