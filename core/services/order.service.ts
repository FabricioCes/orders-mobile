import { BehaviorSubject, Observable, from } from 'rxjs'
import { tap, map } from 'rxjs/operators'
import { OrderApiRepository } from '@/core/repositories/order.repository'
import { Order, OrderDetail } from '@/types/types'
import { ActiveTable } from '@/types/tableTypes'
import { TokenService } from './token.service'

class OrderService {
  // Estado local de las órdenes
  private ordersSubject = new BehaviorSubject<Order[]>([])

  // Observable para suscribirse a los cambios en las órdenes
  orders$ = this.ordersSubject.asObservable()

  async tokenIsValid (): Promise<boolean> {
    const token = await TokenService.getToken()
    return TokenService.checkTokenExpiration(String(token))
  }

  async loadActiveOrders (): Promise<ActiveTable[]> {
    try {
      const activeTables = await OrderApiRepository.getActiveTables()
      return activeTables
    } catch (err) {
      console.error('Error al cargar mesas activas:', err)
      throw err
    }
  }

  async getOrder (orderId: number): Promise<Order> {
    try {
      const localOrder = this.getLocalOrder(orderId)
      if (localOrder) {
        return localOrder
      }
      const order = await OrderApiRepository.getOrder(orderId)
      this.updateLocalOrder(order)
      return order
    } catch (err) {
      console.log('Error al obtener la orden:', err)
      throw err
    }
  }

  async getOrderDetails (orderId: number): Promise<OrderDetail[]> {
    try {
      const localOrder = this.getLocalOrder(orderId)
      if (localOrder && localOrder.detalles) {
        return localOrder.detalles
      }
      const details = await OrderApiRepository.getOrderDetails(orderId)
      this.updateLocalOrderDetails(orderId, details)
      return details
    } catch (err) {
      console.error('Error al obtener los detalles:', err)
      throw err
    }
  }

  async addProduct (
    orderId: number,
    product: OrderDetail
  ): Promise<OrderDetail[]> {
    try {
       const currentOrders = this.ordersSubject.value
      const orderIndex = currentOrders.findIndex(o => o.numeroOrden === orderId)

      if (orderIndex === -1) {
        throw new Error(`Orden con ID ${orderId} no encontrada localmente`)
      }

      const order = currentOrders[orderIndex]
      const currentDetails = order.detalles || []
      const updatedDetails = this.mergeProductDetails(currentDetails, product)

      const updatedOrder = {
        ...order,
        detalles: updatedDetails,
        totalSinDescuento: this.calculateTotal(updatedDetails)
      }

      const updatedOrders = [...currentOrders]
      updatedOrders[orderIndex] = updatedOrder
      this.ordersSubject.next(updatedOrders)

      return updatedDetails
    } catch (err) {
      console.error('Error al añadir producto:', err)
      throw err
    }
  }

  private mergeProductDetails (
    current: OrderDetail[],
    newDetail: OrderDetail
  ): OrderDetail[] {
    const existingIndex = current.findIndex(
      d => d.idProducto === newDetail.idProducto
    )
    if (existingIndex !== -1) {
      const updated = [...current]
      updated[existingIndex].cantidad += newDetail.cantidad
      return updated
    }
    return [...current, newDetail]
  }

  async removeProduct (orderId: number, detailId: number): Promise<void> {
    try {
      const currentOrders = this.ordersSubject.value
      const orderIndex = currentOrders.findIndex(o => o.numeroOrden === orderId)

      if (orderIndex === -1) {
        throw new Error(`Orden con ID ${orderId} no encontrada localmente`)
      }

      const order = currentOrders[orderIndex]
      const updatedDetails = (order.detalles || []).filter(
        detail => detail.idOrdenDetalle !== detailId
      )

      const updatedOrder = {
        ...order,
        detalles: updatedDetails,
        totalSinDescuento: this.calculateTotal(updatedDetails)
      }

      const updatedOrders = [...currentOrders]
      updatedOrders[orderIndex] = updatedOrder
      this.ordersSubject.next(updatedOrders)
    } catch (err) {
      console.error('Error al eliminar producto:', err)
      throw err
    }
  }

  async saveOrder (order: Order): Promise<Order> {
    try {
      let savedOrder: Order
      if (order.esTemporal) {
        const newOrderId = await OrderApiRepository.createOrder(order)
        console.log("NUEVA ORDEN",newOrderId)
        savedOrder = { ...order, numeroOrden: newOrderId }
      } else {
        console.log("Update",order)
        await OrderApiRepository.updateOrder(order)
        savedOrder = order
      }
      this.updateLocalOrder(savedOrder)
      return savedOrder
    } catch (err) {
      console.error('Error al guardar orden:', err)
      throw err
    }
  }

  async updateProductQuantity (
    orderId: number,
    productId: number,
    quantity: number
  ): Promise<void> {
    try {
      const currentOrders = this.ordersSubject.value
      const orderIndex = currentOrders.findIndex(o => o.numeroOrden === orderId)

      if (orderIndex === -1) {
        throw new Error(`Orden con ID ${orderId} no encontrada localmente`)
      }

      const order = currentOrders[orderIndex]
      const currentDetails = order.detalles || []
      const productIndex = currentDetails.findIndex(
        d => d.idProducto === productId
      )

      if (productIndex === -1) {
        throw new Error('Producto no encontrado en la orden')
      }

      const updatedDetails = [...currentDetails]
      updatedDetails[productIndex] = {
        ...updatedDetails[productIndex],
        cantidad: quantity
      }

      const updatedOrder = {
        ...order,
        detalles: updatedDetails,
        totalSinDescuento: this.calculateTotal(updatedDetails)
      }

      const updatedOrders = [...currentOrders]
      updatedOrders[orderIndex] = updatedOrder
      this.ordersSubject.next(updatedOrders)
    } catch (err) {
      console.error('Error al actualizar cantidad:', err)
      throw err
    }
  }

  async temporaryRemoveOrderDetail (
    orderId: number,
    detailId: number
  ): Promise<OrderDetail[]> {
    try {
      const currentOrders = this.ordersSubject.value
      const orderIndex = currentOrders.findIndex(o => o.numeroOrden === orderId)

      if (orderIndex === -1) {
        throw new Error(`Orden con ID ${orderId} no encontrada localmente`)
      }

      const order = currentOrders[orderIndex]
      const updatedDetails = (order.detalles || []).filter(
        detail => detail.idOrdenDetalle !== detailId
      )

      const updatedOrder = {
        ...order,
        detalles: updatedDetails,
        totalSinDescuento: this.calculateTotal(updatedDetails)
      }

      const updatedOrders = [...currentOrders]
      updatedOrders[orderIndex] = updatedOrder
      this.ordersSubject.next(updatedOrders)

      return updatedDetails
    } catch (err) {
      console.error('Error en temporaryRemoveOrderDetail:', err)
      throw err
    }
  }

  /**
   * Calcula el total sin descuento basado en los detalles de la orden.
   * @param details - Lista de detalles actuales.
   * @returns Total sin descuento.
   */
  private calculateTotal (details: OrderDetail[]): number {
    return details.reduce(
      (total, detail) => total + detail.costoUnitario * detail.cantidad,
      0
    )
  }

  /**
   * Sincroniza las órdenes locales con el servidor.
   * @returns Observable que se completa cuando la sincronización termina.
   */
  syncOrders (): Observable<void> {
    const ordersToSync = this.ordersSubject.value
    return from(
      Promise.all(
        ordersToSync.map(order =>
          OrderApiRepository.updateOrder(order).then(() => {
            console.log(`Orden ${order.numeroOrden} sincronizada`)
          })
        )
      )
    ).pipe(
      tap({
        next: () => console.log('Órdenes sincronizadas con el servidor'),
        error: err => console.error('Error al sincronizar órdenes:', err)
      }),
      map(() => void 0)
    )
  }

  /**
   * Actualiza o agrega una orden al estado local.
   * @param order - Orden a actualizar o agregar.
   */
  private updateLocalOrder (order: Order): void {
    const currentOrders = this.ordersSubject.value
    const orderIndex = currentOrders.findIndex(
      o => o.numeroOrden === order.numeroOrden
    )
    const updatedOrders = [...currentOrders]

    if (orderIndex !== -1) {
      updatedOrders[orderIndex] = { ...updatedOrders[orderIndex], ...order }
    } else {
      updatedOrders.push(order)
    }

    this.ordersSubject.next(updatedOrders)
  }

  /**
   * Actualiza los detalles de una orden en el estado local.
   * @param orderId - ID de la orden.
   * @param details - Nuevos detalles.
   */
  private updateLocalOrderDetails (
    orderId: number,
    details: OrderDetail[]
  ): void {
    const currentOrders = this.ordersSubject.value
    const orderIndex = currentOrders.findIndex(o => o.numeroOrden === orderId)

    if (orderIndex !== -1) {
      const updatedOrders = [...currentOrders]
      updatedOrders[orderIndex] = {
        ...updatedOrders[orderIndex],
        detalles: details,
        totalSinDescuento: this.calculateTotal(details)
      }
      this.ordersSubject.next(updatedOrders)
    }
  }

  /**
   * Obtiene una orden del estado local.
   * @param orderId - ID de la orden.
   * @returns La orden encontrada o undefined si no existe.
   */
  private getLocalOrder (orderId: number): Order | undefined {
    return this.ordersSubject.value.find(o => o.numeroOrden === orderId)
  }
}

export const orderService = new OrderService()
