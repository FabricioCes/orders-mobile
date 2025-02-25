import { BehaviorSubject, Observable, from } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { OrderApiRepository } from '@/core/repositories/order.repository';
import { Order, OrderDetail } from '@/types/types';
import { uuidEntero } from '@/utils/uuidUtils';

class TemporaryOrderService {
  // Estado de las órdenes temporales, incluyendo detalles
  private temporaryOrdersSubject = new BehaviorSubject<Order[]>([]);

  // Observable para suscribirse a los cambios en las órdenes temporales
  temporaryOrders$ = this.temporaryOrdersSubject.asObservable();

  /**
   * Crea una nueva orden temporal y la agrega al estado.
   * @param numeroMesa - Número de la mesa.
   * @param zona - Ubicación o zona de la mesa.
   * @returns La orden temporal creada.
   */
  async createTemporaryOrder(numeroMesa: string, zona: string): Promise<Order> {
    const temporaryOrderId = uuidEntero();
    const newOrder: Order = {
      numeroOrden: temporaryOrderId,
      idCliente: 0,
      totalSinDescuento: 0,
      numeroMesa,
      ubicacion: zona,
      esTemporal: true,
      detalles: [], // Inicializamos los detalles como un array vacío
    };
    const currentOrders = this.temporaryOrdersSubject.value;
    this.temporaryOrdersSubject.next([...currentOrders, newOrder]);
    return newOrder;
  }

  /**
   * Elimina una orden temporal del estado.
   * @param orderId - ID de la orden a eliminar.
   */
  removeTemporaryOrder(orderId: number): void {
    const currentOrders = this.temporaryOrdersSubject.value;
    const updatedOrders = currentOrders.filter((o) => o.numeroOrden !== orderId);
    this.temporaryOrdersSubject.next(updatedOrders);
  }

  /**
   * Agrega un detalle a una orden temporal existente.
   * @param orderId - ID de la orden a la que se agregará el detalle.
   * @param detail - Detalle de la orden a agregar.
   * @returns La orden actualizada o undefined si no se encuentra.
   */
  addOrderDetail(orderId: number, detail: Omit<OrderDetail, 'idOrden' | 'idOrdenDetalle'>): Order | undefined {
    const currentOrders = this.temporaryOrdersSubject.value;
    const orderIndex = currentOrders.findIndex((o) => o.numeroOrden === orderId);
    if (orderIndex === -1) return undefined;

    const order = currentOrders[orderIndex];
    const newDetail: OrderDetail = {
      ...detail,
      idOrden: orderId,
      idOrdenDetalle: uuidEntero(),
    };

    const updatedOrder = {
      ...order,
      detalles: [...(order.detalles || []), newDetail],
      totalSinDescuento: this.calculateTotal(order.detalles || [], newDetail),
    };

    const updatedOrders = [...currentOrders];
    updatedOrders[orderIndex] = updatedOrder;
    this.temporaryOrdersSubject.next(updatedOrders);
    return updatedOrder;
  }

  /**
   * Actualiza un detalle existente en una orden temporal.
   * @param orderId - ID de la orden.
   * @param detailId - ID del detalle a actualizar.
   * @param updatedDetail - Datos actualizados del detalle.
   * @returns La orden actualizada o undefined si no se encuentra.
   */
  updateOrderDetail(orderId: number, detailId: number, updatedDetail: Partial<OrderDetail>): Order | undefined {
    const currentOrders = this.temporaryOrdersSubject.value;
    const orderIndex = currentOrders.findIndex((o) => o.numeroOrden === orderId);
    if (orderIndex === -1) return undefined;

    const order = currentOrders[orderIndex];
    const details = order.detalles || [];
    const detailIndex = details.findIndex((d) => d.idOrdenDetalle === detailId);
    if (detailIndex === -1) return undefined;

    const updatedDetails = [...details];
    updatedDetails[detailIndex] = { ...details[detailIndex], ...updatedDetail };

    const updatedOrder = {
      ...order,
      detalles: updatedDetails,
      totalSinDescuento: this.calculateTotal(updatedDetails),
    };

    const updatedOrders = [...currentOrders];
    updatedOrders[orderIndex] = updatedOrder;
    this.temporaryOrdersSubject.next(updatedOrders);
    return updatedOrder;
  }

  /**
   * Elimina un detalle de una orden temporal.
   * @param orderId - ID de la orden.
   * @param detailId - ID del detalle a eliminar.
   * @returns La orden actualizada o undefined si no se encuentra.
   */
  removeOrderDetail(orderId: number, detailId: number): Order | undefined {
    const currentOrders = this.temporaryOrdersSubject.value;
    const orderIndex = currentOrders.findIndex((o) => o.numeroOrden === orderId);
    if (orderIndex === -1) return undefined;

    const order = currentOrders[orderIndex];
    const updatedDetails = (order.detalles || []).filter((d) => d.idOrdenDetalle !== detailId);

    const updatedOrder = {
      ...order,
      detalles: updatedDetails,
      totalSinDescuento: this.calculateTotal(updatedDetails),
    };

    const updatedOrders = [...currentOrders];
    updatedOrders[orderIndex] = updatedOrder;
    this.temporaryOrdersSubject.next(updatedOrders);
    return updatedOrder;
  }

  /**
   * Calcula el total sin descuento basado en los detalles de la orden.
   * @param details - Lista de detalles actuales.
   * @param newDetail - Detalle nuevo (opcional, para agregar al cálculo).
   * @returns Total sin descuento.
   */
  private calculateTotal(details: OrderDetail[], newDetail?: OrderDetail): number {
    const allDetails = newDetail ? [...details, newDetail] : details;
    return allDetails.reduce((total, detail) => total + (detail.costoUnitario * detail.cantidad), 0);
  }

  /**
   * Sincroniza las órdenes temporales con el servidor y las elimina del estado temporal.
   * @returns Observable que se completa cuando la sincronización termina.
   */
  syncTemporaryOrders(): Observable<void> {
    const ordersToSync = this.temporaryOrdersSubject.value;
    return from(
      Promise.all(
        ordersToSync.map((order) =>
          OrderApiRepository.createOrder(order).then((res) => {
            if (order.numeroOrden !== undefined) {
              this.removeTemporaryOrder(order.numeroOrden);
            }
            order.numeroOrden = res;
          })
        )
      )
    ).pipe(
      tap({
        next: () => console.log('Órdenes temporales sincronizadas'),
        error: (err) => console.log('Error al sincronizar órdenes temporales:', err),
      }),
      map(() => void 0)
    );
  }

  /**
   * Obtiene una orden temporal específica por su ID.
   * @param orderId - ID de la orden.
   * @returns La orden encontrada o undefined si no existe.
   */
  getTemporaryOrder(orderId: number): Order | undefined {
    return this.temporaryOrdersSubject.value.find((o) => o.numeroOrden === orderId);
  }
}

export const temporaryOrderService = new TemporaryOrderService();
