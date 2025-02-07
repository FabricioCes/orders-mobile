// src/services/order.service.ts
import { BehaviorSubject, Observable, from } from 'rxjs'
import { tap } from 'rxjs/operators'
import {
  OrderApiRepository,
  OrderCacheRepository
} from '@/repositories/order.repository'
import { Order, OrderDetail } from '@/types/types'
import { ActiveTable } from '@/types/tableTypes'

class OrderService {
  private orderSubject = new BehaviorSubject<Order|null>(null)
  private activeTableSubject = new BehaviorSubject<ActiveTable[]>([])
  private orderDetailsSubject = new BehaviorSubject<OrderDetail[]>([])
  private currentOrderId: number | null = null;

  order$ = this.orderSubject.asObservable()
  activeTables$ = this.activeTableSubject.asObservable()
  orderDetails$ = this.orderDetailsSubject.asObservable()

  clearCurrentOrder() {
    this.currentOrderId = null;
    this.orderSubject.next(null);
    this.orderDetailsSubject.next([]);
  }

  loadActiveOrders$ (): Observable<ActiveTable[]> {
    return from(OrderApiRepository.getActiveTables()).pipe(
      tap({
        next: activeTables => {
          this.activeTableSubject.next(activeTables)
          //OrderCacheRepository.cacheOrders(activeTables); // Si se implementa
        },
        error: err => console.log('Error en carga:', err)
      })
      // catchError(error => {
      //   // Recuperación desde caché si hay error
      //   return from(OrderCacheRepository.getCachedOrders());
      // })
    )
  }

  getOrder$ (orderId: number): Observable<Order | null> {
    if (this.currentOrderId !== orderId) {
      this.currentOrderId = orderId;
      this.orderSubject.next(null);
    }
    return from(OrderApiRepository.getOrder(orderId)).pipe(
      tap({
        next: orden => {
          this.orderSubject.next(orden)
          OrderCacheRepository.cacheOrder(orderId, orden)
        },
        error: err => console.log('Error al obtener la orden', err)
      })
    )
  }
  getOrderDetails$ (orderId: number): Observable<OrderDetail[]> {
    return from(OrderApiRepository.getOrderDetails(orderId)).pipe(
      tap({
        next: details => {
          this.orderDetailsSubject.next(details)
          OrderCacheRepository.cacheDetails(orderId, details)
        },
        error: err => console.log('Error al obtener el detalle:', err)
      })
    )
  }

  async addProduct (orderId: number, product: OrderDetail): Promise<void> {
    const currentDetails = this.orderDetailsSubject.value
    try {
      const updatedDetails = this.mergeProductDetails(currentDetails, product)

      // Optimistic update
      this.orderDetailsSubject.next(updatedDetails)
      await OrderCacheRepository.cacheDetails(orderId, updatedDetails)

      // Persist to API
      await OrderApiRepository.updateOrder({
        numeroOrden: orderId,
        detalles: updatedDetails
      } as Order)
    } catch (error) {
      // Rollback on error
      this.orderDetailsSubject.next(currentDetails)
      throw error
    }
  }

  private mergeProductDetails (
    current: OrderDetail[],
    newDetail: OrderDetail
  ): OrderDetail[] {
    const existingIndex = current.findIndex(
      d => d.identificadorProducto === newDetail.identificadorProducto
    )
    if (existingIndex !== -1) {
      const updated = [...current]
      updated[existingIndex].cantidad += newDetail.cantidad
      return updated
    }
    return [...current, newDetail]
  }

  async removeProduct (orderId: number, detailId: number): Promise<void> {
    const currentDetails = this.orderDetailsSubject.value
    try {
      const updatedDetails = currentDetails.filter(
        d => d.identificadorOrdenDetalle !== detailId
      )

      // Optimistic update
      this.orderDetailsSubject.next(updatedDetails)
      await OrderCacheRepository.cacheDetails(orderId, updatedDetails)

      // Persist to API
      await OrderApiRepository.deleteOrderDetail(detailId)
    } catch (error) {
      this.orderDetailsSubject.next(currentDetails)
      throw error
    }
  }

  async saveOrder (order: Order): Promise<void> {
    if (!order.numeroOrden) {
      const newOrderId = await OrderApiRepository.createOrder(order)
      order.numeroOrden = newOrderId
    } else {
      await OrderApiRepository.updateOrder(order)
    }
    await OrderCacheRepository.cacheOrder(order.numeroOrden, order)
  }

  async updateProductQuantity (
    orderId: number,
    productId: number,
    quantity: number
  ): Promise<void> {
    const currentDetails = this.orderDetailsSubject.value
    const productIndex = currentDetails.findIndex(
      d => d.identificadorProducto === productId
    )

    if (productIndex === -1) {
      throw new Error('Producto no encontrado en la orden')
    }

    const updatedDetails = [...currentDetails]
    updatedDetails[productIndex] = {
      ...updatedDetails[productIndex],
      cantidad: quantity
    }

    const newTotal = updatedDetails.reduce(
      (sum, detail) => sum + detail.costoUnitario * detail.cantidad,
      0
    )

    this.orderDetailsSubject.next(updatedDetails)
    await OrderCacheRepository.cacheDetails(orderId, updatedDetails)

    const currentOrder = this.orderSubject.value;

      const updatedOrder = {
        ...currentOrder,
        totalSinDescuento: newTotal,
        detalles: updatedDetails,
      }
      this.orderSubject.next(updatedOrder)
      await OrderCacheRepository.cacheOrder(orderId, updatedOrder)
    }
}

export const orderService = new OrderService()
