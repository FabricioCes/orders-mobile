import { BehaviorSubject, Observable, from, of } from 'rxjs'
import { tap } from 'rxjs/operators'
import { OrderApiRepository } from '@/core/repositories/order.repository'
import { Order, OrderDetail, SaveOptions } from '@/types/types'
import { uuidEntero } from '@/utils/uuidUtils'
import { ModoImpresion } from '@/types/enums'

class TemporaryOrderService {
  // Se utiliza BehaviorSubject con un único Order o null
  private temporaryOrderSubject = new BehaviorSubject<Order | null>(null)

  // Observable para suscribirse a los cambios en la orden temporal
  temporaryOrder$ = this.temporaryOrderSubject.asObservable()

  /**
   * Crea una nueva orden temporal y la asigna al estado.
   * @param numeroMesa - Número de la mesa.
   * @param zona - Ubicación o zona de la mesa.
   * @returns La orden temporal creada.
   */
  async createTemporaryOrder (numeroMesa: string, zona: string): Promise<Order> {
    const temporaryOrderId = uuidEntero()
    const newOrder: Order = {
      numeroOrden: temporaryOrderId,
      idCliente: 0,
      totalSinDescuento: 0,
      numeroMesa,
      ubicacion: zona,
      esTemporal: true,
      detalles: [] // Inicializamos los detalles como array vacío
    }
    this.temporaryOrderSubject.next(newOrder)
    return newOrder
  }

  /**
   * Elimina la orden temporal asignada.
   * @param orderId - ID de la orden a eliminar.
   */
  removeTemporaryOrder (orderId: number): void {
    const currentOrder = this.temporaryOrderSubject.value
    if (currentOrder && currentOrder.numeroOrden === orderId) {
      this.temporaryOrderSubject.next(null)
    }
  }

  /**
   * Agrega un detalle a la orden temporal.
   * @param orderId - ID de la orden.
   * @param detail - Detalle a agregar (sin las propiedades idOrden e idOrdenDetalle).
   * @returns La orden actualizada o undefined si no se encontró la orden.
   */
  addOrderDetail (
    orderId: number,
    detail: Omit<OrderDetail, 'idOrden' | 'idOrdenDetalle'>
  ): Order | undefined {
    const currentOrder = this.temporaryOrderSubject.value
    if (!currentOrder || currentOrder.numeroOrden !== orderId) return undefined

    // Creamos un nuevo detalle asignándole un id único para la línea
    const newDetail: OrderDetail = {
      ...detail,
      idOrden: orderId,
      idOrdenDetalle: uuidEntero()
    }

    const currentDetails = currentOrder.detalles || []
    // Buscamos si ya existe un detalle con el mismo producto
    const existingIndex = currentDetails.findIndex(
      d => d.idProducto === newDetail.idProducto
    )

    let updatedDetails: OrderDetail[]
    if (existingIndex !== -1) {
      // Si ya existe, actualizamos la cantidad sumando la nueva cantidad
      updatedDetails = [...currentDetails]
      updatedDetails[existingIndex] = {
        ...updatedDetails[existingIndex],
        cantidad: updatedDetails[existingIndex].cantidad + newDetail.cantidad
      }
    } else {
      // Si no existe, lo agregamos a la lista
      updatedDetails = [...currentDetails, newDetail]
    }

    const updatedOrder = {
      ...currentOrder,
      detalles: updatedDetails,
      totalSinDescuento: this.calculateTotal(updatedDetails)
    }

    this.temporaryOrderSubject.next(updatedOrder)
    return updatedOrder
  }

  /**
   * Actualiza un detalle existente en la orden temporal.
   * @param orderId - ID de la orden.
   * @param detailId - ID del detalle a actualizar.
   * @param updatedDetail - Datos actualizados del detalle.
   * @returns La orden actualizada o undefined si no se encuentra.
   */
  updateOrderDetail (
    orderId: number,
    detailId: number,
    updatedDetail: Partial<OrderDetail>
  ): Order | undefined {
    const currentOrder = this.temporaryOrderSubject.value
    if (!currentOrder || currentOrder.numeroOrden !== orderId) return undefined

    const details = currentOrder.detalles || []
    const detailIndex = details.findIndex(d => d.idOrdenDetalle === detailId)
    if (detailIndex === -1) return undefined

    const updatedDetails = [...details]
    updatedDetails[detailIndex] = {
      ...updatedDetails[detailIndex],
      ...updatedDetail
    }

    const updatedOrder = {
      ...currentOrder,
      detalles: updatedDetails,
      totalSinDescuento: this.calculateTotal(updatedDetails)
    }

    this.temporaryOrderSubject.next(updatedOrder)
    return updatedOrder
  }

  /**
   * Elimina un detalle de la orden temporal.
   * @param orderId - ID de la orden.
   * @param detailId - ID del detalle a eliminar.
   * @returns La orden actualizada o undefined si no se encuentra.
   */
  removeOrderDetail (orderId: number, detailId: number): Order | undefined {
    const currentOrder = this.temporaryOrderSubject.value
    if (!currentOrder || currentOrder.numeroOrden !== orderId) return undefined

    const updatedDetails = (currentOrder.detalles || []).filter(
      d => d.idOrdenDetalle !== detailId
    )

    const updatedOrder = {
      ...currentOrder,
      detalles: updatedDetails,
      totalSinDescuento: this.calculateTotal(updatedDetails)
    }

    this.temporaryOrderSubject.next(updatedOrder)
    return updatedOrder
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
   * Sincroniza la orden temporal con el servidor y la elimina del estado.
   * @returns Observable que emite un objeto { temporaryOrderId, newOrderId } o null si no hay orden.
   */
  syncTemporaryOrder (options: SaveOptions): Observable<{
    temporaryOrderId: number
    newOrderId: number
  } | null> {
    const currentOrder = this.temporaryOrderSubject.value
    if (!currentOrder) {
      return of(null)
    }
    return from(
      (async () => {
        const temporaryOrderId = Number(currentOrder.numeroOrden)
        const newOrderId = await OrderApiRepository.createOrder(currentOrder, options)
        this.removeTemporaryOrder(Number(temporaryOrderId))
        return { temporaryOrderId, newOrderId }
      })()
    ).pipe(
      tap({
        next: result => console.log('Orden temporal sincronizada:', result),
        error: err =>
          console.log('Error al sincronizar la orden temporal:', err)
      })
    )
  }

  /**
   * Obtiene la orden temporal actual si coincide con el ID dado.
   * @param orderId - ID de la orden.
   * @returns La orden encontrada o undefined si no coincide.
   */
  getTemporaryOrder (orderId: number): Order | undefined {
    const currentOrder = this.temporaryOrderSubject.value
    if (currentOrder && currentOrder.numeroOrden === orderId) {
      return currentOrder
    }
    return undefined
  }
}

export const temporaryOrderService = new TemporaryOrderService()
