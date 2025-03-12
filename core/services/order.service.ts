import { OrderApiRepository } from '@/core/repositories/order.repository'
import { Order, OrderDetail, SaveOptions } from '@/types/types'
import { ActiveTable } from '@/types/tableTypes'
import { TokenService } from './token.service'

class OrderService {

  async tokenIsValid (): Promise<boolean> {
    return TokenService.checkTokenExpiration()
  }

  // Carga las mesas activas
  async loadActiveOrders (): Promise<ActiveTable[]> {
    try {
      const activeTables = await OrderApiRepository.getActiveTables()
      return activeTables
    } catch {
      throw new Error('Error al cargar mesas activas')
    }
  }

  // Obtiene una orden por ID
  async getOrder (orderId: number): Promise<Order> {
    try {
      const order = await OrderApiRepository.getOrder(orderId)
      return order
    } catch {
      throw new Error(`Error al obtener la orden con ID ${orderId}`)
    }
  }

  // Obtiene los detalles de una orden
  async getOrderDetails (orderId: number): Promise<OrderDetail[]> {
    try {
      const details = await OrderApiRepository.getOrderDetails(orderId)
      return details
    } catch {
      throw new Error(
        `Error al obtener los detalles de la orden con ID ${orderId}`
      )
    }
  }

  // Actualiza una orden existente
  async updateOrder (
    orderId: number,
    updatedOrderData: Partial<Order>,
    options: SaveOptions = {} as SaveOptions
  ): Promise<Order> {
    try {
      const updatedOrder = await OrderApiRepository.updateOrder(
        updatedOrderData,
        options
      )
      return updatedOrder
    } catch {
      throw new Error(`Error al actualizar la orden con ID ${orderId}`)
    }
  }

  // Sincroniza una orden con el servidor
  async syncOrder (order: Order, options: SaveOptions): Promise<void> {
    try {
      await OrderApiRepository.updateOrder(order, options)
    } catch {
      throw new Error(
        `Error al sincronizar la orden con ID ${order.numeroOrden}`
      )
    }
  }
}

export const orderService = new OrderService()
