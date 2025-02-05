import { BehaviorSubject, Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { orderRepository } from '../services/order.repository'
import { Order, OrderDetail } from '@/types/types'

class OrderService {
  private ordersSubject = new BehaviorSubject<Order[]>([])
  private orderDetailsSubject = new BehaviorSubject<OrderDetail[]>([])

  // Exponemos los observables generales
  orders$ = this.ordersSubject.asObservable()
  orderDetails$ = this.orderDetailsSubject.asObservable()

  // Método para cargar todas las órdenes activas
  async loadActiveOrders() {
    try {
      const orders = await orderRepository.getActiveTables()
      this.ordersSubject.next(orders)
    } catch (error) {
      console.error('Error loading active orders:', error)
    }
  }

  // Método para cargar los detalles de una orden
  async loadOrderDetails(orderId: number) {
    try {
      const details = await orderRepository.getOrderDetails(orderId)
      this.orderDetailsSubject.next(details)
    } catch (error) {
      console.error(`Error loading order details for order ${orderId}:`, error)
    }
  }

  // Devuelve un observable con la orden filtrada por orderId
  getOrder$(orderId: number): Observable<Order | null> {
    // Primero se asegura que se hayan cargado las órdenes (en una implementación real quizás se invoque loadActiveOrders en otro sitio)
    return this.orders$.pipe(
      map((orders) => orders.find((o) => o.numeroOrden === orderId) || null)
    )
  }

  // Devuelve un observable con los detalles de la orden.
  // Se asegura de cargar los detalles si aún no se han obtenido.
  getOrderDetails$(orderId: number): Observable<OrderDetail[]> {
    // Si aún no se han cargado, se dispara la carga (aunque en un escenario más robusto se podría verificar el id)
    if (!this.orderDetailsSubject.getValue().length) {
      this.loadOrderDetails(orderId)
    }
    return this.orderDetails$
  }

  async addProduct(orderId: number, product: OrderDetail) {
    try {
      const currentOrderDetails = await this.getCachedOrServerOrderDetails(orderId)
      const existingProduct = currentOrderDetails.find(
        (detail) => detail.idProducto === product.idProducto
      )

      if (existingProduct) {
        existingProduct.cantidad += product.cantidad
      } else {
        currentOrderDetails.push(product)
      }

      this.orderDetailsSubject.next([...currentOrderDetails])
    } catch (error) {
      console.error(`Error adding product to order ${orderId}:`, error)
    }
  }

  async removeProduct(orderId: number, detailId: number) {
    try {
      await orderRepository.deleteOrderDetail(detailId)
      const updatedDetails = await this.getCachedOrServerOrderDetails(orderId)
      this.orderDetailsSubject.next(updatedDetails)
    } catch (error) {
      console.error(`Error removing product from order ${orderId}:`, error)
    }
  }

  async saveOrder(order: Order) {
    try {
      if (!order.numeroOrden) {
        throw new Error('Order number is required to save an order.')
      }
      await orderRepository.createOrder(order)
      console.log(`Order ${order.numeroOrden} saved successfully.`)
    } catch (error) {
      console.error('Error saving order:', error)
    }
  }

  async updateOrder(order: Order) {
    try {
      if (!order.numeroOrden) {
        throw new Error('Order number is required to update an order.')
      }
      await orderRepository.updateOrder(order)
      console.log(`Order ${order.numeroOrden} updated successfully.`)
    } catch (error) {
      console.error('Error updating order:', error)
    }
  }

  private async getCachedOrServerOrderDetails(
    orderId: number
  ): Promise<OrderDetail[]> {
    try {
      const cachedDetails = this.orderDetailsSubject.getValue()
      if (cachedDetails.length) return cachedDetails
      const details = await orderRepository.getOrderDetails(orderId)
      this.orderDetailsSubject.next(details)
      return details
    } catch (error) {
      console.error(
        `Error fetching cached or server order details for order ${orderId}:`,
        error
      )
      return []
    }
  }
}

export const orderService = new OrderService()
