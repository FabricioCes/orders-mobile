// src/services/order.service.ts
import { BehaviorSubject, Observable, from } from 'rxjs'
import { map, switchMap, tap } from 'rxjs/operators'
import {
  OrderApiRepository,
  OrderCacheRepository
} from '@/repositories/order.repository'
import { Order, OrderDetail } from '@/types/types'

class OrderService {
  private ordersSubject = new BehaviorSubject<Order[]>([])
  private orderDetailsSubject = new BehaviorSubject<OrderDetail[]>([])

  orders$ = this.ordersSubject.asObservable()
  orderDetails$ = this.orderDetailsSubject.asObservable()

  async loadActiveOrders (): Promise<void> {
    try {
      const orders = await OrderApiRepository.getActiveTables()
      this.ordersSubject.next(orders)
      await OrderCacheRepository.cacheOrders(orders)
    } catch (error) {
      console.error('Error loading active orders:', error)
      throw error
    }
  }

  getOrder$ (orderId: number): Observable<Order | null> {
    return from(OrderCacheRepository.getCachedOrder(orderId)).pipe(
      switchMap(cachedOrder => {
        if (cachedOrder) return from([cachedOrder])
        return from(OrderApiRepository.getOrder(orderId)).pipe(
          tap(order => OrderCacheRepository.cacheOrder(orderId, order))
        )
      }),
      map(order => order || null)
    )
  }

  getOrderDetails$ (orderId: number): Observable<OrderDetail[]> {
    return from(OrderCacheRepository.getCachedDetails(orderId)).pipe(
      switchMap(cachedDetails => {
        if (cachedDetails.length) return from([cachedDetails])
        return from(OrderApiRepository.getOrderDetails(orderId)).pipe(
          tap(details => OrderCacheRepository.cacheDetails(orderId, details))
        )
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
}

export const orderService = new OrderService()
