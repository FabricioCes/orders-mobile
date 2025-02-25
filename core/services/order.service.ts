// order.service.ts
import { OrderApiRepository } from '@/core/repositories/order.repository'
import { Order, OrderDetail } from '@/types/types'
import { ActiveTable } from '@/types/tableTypes'
import { TokenService } from './token.service'

class OrderService {
  async tokenIsValid() {
    const token = await TokenService.getToken();
    return TokenService.checkTokenExpiration(String(token));
  }

  async loadActiveOrders(): Promise<ActiveTable[]> {
    try {
      const activeTables = await OrderApiRepository.getActiveTables();
      return activeTables;
    } catch (err) {
      console.error('Error al cargar mesas activas:', err);
      throw err;
    }
  }

  async getOrder(orderId: number): Promise<Order> {
    try {
      return await OrderApiRepository.getOrder(orderId);
    } catch (err) {
      console.error('Error al obtener la orden:', err);
      throw err;
    }
  }

  async getOrderDetails(orderId: number): Promise<OrderDetail[]> {
    try {
      return await OrderApiRepository.getOrderDetails(orderId);
    } catch (err) {
      console.error('Error al obtener los detalles:', err);
      throw err;
    }
  }

  async addProduct(orderId: number, product: OrderDetail): Promise<OrderDetail[]> {
    try {
      // Obtenemos el listado actual de detalles
      const currentDetails = await OrderApiRepository.getOrderDetails(orderId);
      // Se realiza la fusión del producto en el listado actual
      const updatedDetails = this.mergeProductDetails(currentDetails, product);
      // Aquí podrías actualizar el backend si fuese necesario.
      return updatedDetails;
    } catch (err) {
      console.error('Error al añadir producto:', err);
      throw err;
    }
  }

  private mergeProductDetails(current: OrderDetail[], newDetail: OrderDetail): OrderDetail[] {
    const existingIndex = current.findIndex(
      d => d.identificadorProducto === newDetail.identificadorProducto
    );
    if (existingIndex !== -1) {
      const updated = [...current];
      updated[existingIndex].cantidad += newDetail.cantidad;
      return updated;
    }
    return [...current, newDetail];
  }

  async removeProduct(orderId: number, detailId: number): Promise<void> {
    try {
      await OrderApiRepository.deleteOrderDetail(detailId);
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      throw err;
    }
  }

  async saveOrder(order: Order): Promise<Order> {
    let savedOrder: Order;
    if (!order.numeroOrden) {
      const newOrderId = await OrderApiRepository.createOrder(order);
      savedOrder = { ...order, numeroOrden: newOrderId };
    } else {
      await OrderApiRepository.updateOrder(order);
      savedOrder = order;
    }
    return savedOrder;
  }

  async updateProductQuantity(orderId: number, productId: number, quantity: number): Promise<void> {
    try {
      const currentDetails = await OrderApiRepository.getOrderDetails(orderId);
      const productIndex = currentDetails.findIndex(d => d.identificadorProducto === productId);
      if (productIndex === -1) {
        throw new Error('Producto no encontrado en la orden');
      }
      const updatedDetails = [...currentDetails];
      updatedDetails[productIndex] = {
        ...updatedDetails[productIndex],
        cantidad: quantity
      };
      const newTotal = updatedDetails.reduce(
        (sum, detail) => sum + detail.costoUnitario * detail.cantidad,
        0
      );
      const currentOrder = await OrderApiRepository.getOrder(orderId);
      const updatedOrder = { ...currentOrder, totalSinDescuento: newTotal, detalles: updatedDetails };
      await OrderApiRepository.updateOrder(updatedOrder);
    } catch (err) {
      console.error('Error al actualizar cantidad:', err);
      throw err;
    }
  }

  async temporaryRemoveOrderDetail(orderId: number, detailId: number): Promise<OrderDetail[]> {
    try {
      const currentDetails = await OrderApiRepository.getOrderDetails(orderId);
      const updatedDetails = currentDetails.filter(
        detail => detail.identificadorOrdenDetalle !== detailId
      );
      // Aquí podrías, si fuese necesario, actualizar el total de la orden en el backend.
      return updatedDetails;
    } catch (err) {
      console.error('Error en temporaryRemoveOrderDetail:', err);
      throw err;
    }
  }
}

export const orderService = new OrderService();
