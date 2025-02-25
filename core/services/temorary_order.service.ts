import { BehaviorSubject, Observable, from } from 'rxjs'
import { tap, map } from 'rxjs/operators'
import { OrderApiRepository } from '@/core/repositories/order.repository'
import { Order } from '@/types/types'
import { uuidEntero } from '@/utils/uuidUtils'

class TemporaryOrderService {
  // Estado de las órdenes temporales
  private temporaryOrdersSubject = new BehaviorSubject<Order[]>([])

  // Observable para suscribirse a los cambios en las órdenes temporales
  temporaryOrders$ = this.temporaryOrdersSubject.asObservable()

  /**
   * Crea una nueva orden temporal y la agrega al estado.
   * @param numeroMesa - Número de la mesa.
   * @param zona - Ubicación o zona de la mesa.
   * @returns La orden temporal creada.
   */

  async createTemporaryOrder(numeroMesa: string, zona: string): Promise<Order> {
    const temporaryOrderId = uuidEntero()
    const newOrder: Order = {
      numeroOrden: 0,
      idCliente: 0,
      totalSinDescuento: 0,
      numeroMesa,
      ubicacion: zona,
      esTemporal: true
    }
    const currentOrders = this.temporaryOrdersSubject.value
    this.temporaryOrdersSubject.next([...currentOrders, newOrder])
    return newOrder
  }

  /**
   * Elimina una orden temporal del estado.
   * @param orderId - ID de la orden a eliminar.
   */
  removeTemporaryOrder(orderId: number): void {
    const currentOrders = this.temporaryOrdersSubject.value
    const updatedOrders = currentOrders.filter(o => o.numeroOrden !== orderId)
    this.temporaryOrdersSubject.next(updatedOrders)
  }

  /**
   * Sincroniza las órdenes temporales con el servidor y las elimina del estado temporal.
   * @returns Observable que se completa cuando la sincronización termina.
   */
  syncTemporaryOrders(): Observable<void> {
    const ordersToSync = this.temporaryOrdersSubject.value
    return from(
      Promise.all(
        ordersToSync.map(order =>
          OrderApiRepository.createOrder(order).then(() => {
            if (order.numeroOrden !== undefined) {
              this.removeTemporaryOrder(order.numeroOrden)
            }
          })
        )
      )
    ).pipe(
      tap({
        next: () => console.log('Órdenes temporales sincronizadas'),
        error: err => console.log('Error al sincronizar órdenes temporales:', err)
      }),
      map(() => void 0)
    )
  }
}

export const temporaryOrderService = new TemporaryOrderService()