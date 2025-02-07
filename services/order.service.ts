// src/services/order.service.ts
import { BehaviorSubject, Observable, from } from 'rxjs'
import { catchError, map, switchMap, tap } from 'rxjs/operators'
import {
  OrderApiRepository,
  OrderCacheRepository
} from '@/repositories/order.repository'
import { Order, OrderDetail } from '@/types/types'
import { ActiveTable } from '@/types/tableTypes'

class OrderService {
  private ordersSubject = new BehaviorSubject<Order[]>([])
  private activeTableSubject = new BehaviorSubject<ActiveTable[]>([])
  private orderDetailsSubject = new BehaviorSubject<OrderDetail[]>([])

  orders$ = this.ordersSubject.asObservable()
  activeTables$ = this.activeTableSubject.asObservable()
  orderDetails$ = this.orderDetailsSubject.asObservable()

  loadActiveOrders$ (): Observable<ActiveTable[]> {
    return from(OrderApiRepository.getActiveTables()).pipe(
      tap({
        next: activeTables => {
          console.log('Datos recibidos:', activeTables)
          this.activeTableSubject.next(activeTables)
          //OrderCacheRepository.cacheOrders(activeTables); // Si se implementa
        },
        error: err => console.error('Error en carga:', err)
      })
      // catchError(error => {
      //   // Recuperación desde caché si hay error
      //   return from(OrderCacheRepository.getCachedOrders());
      // })
    )
  }

  // getOrder$ (orderId: number): Observable<Order | null> {
  //   return from(OrderCacheRepositvoidory.getCachedOrder(orderId)).pipe(
  //     switchMap(cachedOrder => {
  //       if (cachedOrder) return from([cachedOrder])
  //       return from(OrderApiRepository.getOrder(orderId)).pipe(
  //         tap(order => OrderCacheRepository.cacheOrder(orderId, order))
  //       )
  //     }),
  //     map(order => order || null)
  //   )
  // }

  getOrder$ (orderId: number): Observable<Order | null> {
    return from(OrderApiRepository.getOrder(orderId))
  }
  getOrderDetails$ (orderId: number): Observable<OrderDetail[]> {
    return from(OrderApiRepository.getOrderDetails(orderId)).pipe(
      tap(details => {
        this.orderDetailsSubject.next(details)
        OrderCacheRepository.cacheDetails(orderId, details)
      })
    )
  }
  // getOrderDetails$ (orderId: number): Observable<OrderDetail[]> {
  //   return from(OrderCacheRepository.getCachedDetails(orderId)).pipe(
  //     switchMap(cachedDetails => {
  //       if (cachedDetails.length) return from([cachedDetails])
  //       return from(OrderApiRepository.getOrderDetails(orderId)).pipe(
  //         tap(details => OrderCacheRepository.cacheDetails(orderId, details))
  //       )
  //     })
  //   )
  // }

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

    const currentOrders = this.ordersSubject.value
    const orderIndex = currentOrders.findIndex(o => o.numeroOrden === orderId)

    if (orderIndex !== -1) {
      const updatedOrders = [...currentOrders]
      updatedOrders[orderIndex] = {
        ...updatedOrders[orderIndex],
        totalSinDescuento: newTotal,
        detalles: updatedDetails
      }
      this.ordersSubject.next(updatedOrders)
      await OrderCacheRepository.cacheOrders(updatedOrders)
    }
  }
}

export const orderService = new OrderService()
