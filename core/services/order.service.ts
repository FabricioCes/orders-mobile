// src/services/order.service.ts
import { BehaviorSubject, Observable, combineLatest, defer, from, throwError } from 'rxjs'
import { catchError, map, switchMap, tap } from 'rxjs/operators'
import {
  OrderApiRepository,
  OrderCacheRepository
} from '@/core/repositories/order.repository'
import { Order, OrderDetail } from '@/types/types'
import { ActiveTable } from '@/types/tableTypes'
import { offlineService } from './offlineService'

class OrderService {
  private orderSubject = new BehaviorSubject<Order | null>(null)
  private activeTablesSubject = new BehaviorSubject<ActiveTable[]>([])
  private orderDetailsSubject = new BehaviorSubject<OrderDetail[]>([])
  private currentOrderId: number | null = null
  private currentOrderSubject = new BehaviorSubject<Order | null>(null)
  private temporaryOrder: Order | null = null
  private temporaryOrdersSubject = new BehaviorSubject<Order[]>([])

  order$ = this.orderSubject.asObservable()
  activeTables$ = this.activeTablesSubject.asObservable()
  orderDetails$ = this.orderDetailsSubject.asObservable()

  clearCurrentOrder () {
    this.currentOrderId = null
    this.orderSubject.next(null)
    this.orderDetailsSubject.next([])
  }
  readonly combinedActiveTables$ = combineLatest([
    this.activeTablesSubject.asObservable(),
    this.temporaryOrdersSubject.asObservable()
  ]).pipe(
    map(([serverTables, tempOrders]) => [
      ...serverTables,
      ...tempOrders.map(order => ({
        identificador: order.numeroOrden,
        numeroMesa: order.numeroMesa,
        zona: order.ubicacion,
        totalConDescuento: order.totalSinDescuento,
        esTemporal: true
      }))
    ])
  )
  loadActiveOrders$ (): Observable<ActiveTable[]> {
    return from(OrderApiRepository.getActiveTables()).pipe(
      tap({
        next: activeTables => {
          this.activeTablesSubject.next(activeTables)
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
      this.currentOrderId = orderId
      this.orderSubject.next(null)
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

  createTemporaryOrder (numeroMesa: string, zona: string): Observable<Order> {
    return defer(async () => {
      const temporaryOrderId = Date.now() * 9999

      const newOrder: Order = {
        numeroOrden: temporaryOrderId,
        idCliente: 0,
        totalSinDescuento: 0,
        numeroMesa,
        ubicacion: zona,
        esTemporal: true
      }

      // Actualizar estado local
      this.temporaryOrdersSubject.next([
        ...this.temporaryOrdersSubject.value,
        newOrder
      ])

      // Persistencia offline
      await offlineService.saveOfflineOrder(temporaryOrderId, newOrder)

      // Emitir orden actual
      this.orderSubject.next(newOrder)
      this.orderDetailsSubject.next([])

      return newOrder
    }).pipe(
      catchError(error => {
        console.error('Error creating temporary order:', error)
        return throwError(() => new Error('No se pudo crear la orden temporal'))
      })
    )
  }

  removeTemporaryOrder (orderId: number): void {
    this.temporaryOrdersSubject.next(
      this.temporaryOrdersSubject.value.filter(o => o.numeroOrden !== orderId)
    )
    offlineService.removeOfflineOrder(orderId)
  }

  // Para cargar mesas activas con datos combinados
  loadActiveOrders (): Observable<ActiveTable[]> {
    return from(this.loadActiveOrders()).pipe(
      tap(serverOrders => {
        this.activeTablesSubject.next(serverOrders)
      }),
      switchMap(() => this.activeTables$)
    )
  }

  currentOrderExists (): boolean {
    return !!this.temporaryOrder || !!this.currentOrderSubject.value
  }

  async addProduct (
    orderId: number,
    product: OrderDetail
  ): Promise<OrderDetail[]> {
    const currentDetails = this.orderDetailsSubject.value
    try {
      const updatedDetails = this.mergeProductDetails(currentDetails, product)
      this.orderDetailsSubject.next(updatedDetails)

      if (orderId && orderId > 0) {
        await OrderCacheRepository.cacheDetails(orderId, updatedDetails)
      } else {
        const currentOrder = this.orderSubject.value
        if (currentOrder) {
          const newTotal = updatedDetails.reduce(
            (sum, detail) => sum + detail.costoUnitario * detail.cantidad,
            0
          )
          const updatedOrder = {
            ...currentOrder,
            totalSinDescuento: newTotal,
            detalles: updatedDetails
          }
          this.orderSubject.next(updatedOrder)
          await offlineService.saveOfflineOrder(0, updatedOrder)
          console.log('Orden temporal actualizada offline:', updatedOrder)
        }
      }

      return updatedDetails
    } catch (error) {
      this.orderDetailsSubject.next(currentDetails)
      throw error
    }
  }

  private mergeProductDetails (
    current: OrderDetail[],
    newDetail: OrderDetail
  ): OrderDetail[] {
    console.log('merge')
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
    await OrderApiRepository.updateOrder({
      ...order,
      detalles: this.orderDetailsSubject.value
    })
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

    const currentOrder = this.orderSubject.value

    const updatedOrder = {
      ...currentOrder,
      totalSinDescuento: newTotal,
      detalles: updatedDetails
    }
    this.orderSubject.next(updatedOrder)
    await OrderCacheRepository.cacheOrder(orderId, updatedOrder)
  }
}

export const orderService = new OrderService()
