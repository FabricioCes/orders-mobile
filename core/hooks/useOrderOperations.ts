import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { Order, OrderDetail } from '@/types/types';
import { orderService } from '@/core/services/order.service';
import { temporaryOrderService } from '@/core/services/temporary_order.service';
import { useOrder } from '../context/OrderContext';
import { Product } from '@/types/productTypes';
import { uuidEntero } from '@/utils/uuidUtils';
import { firstValueFrom } from 'rxjs';

export const useOrderOperations = (orderId: number, currentOrder: Order | null = null) => {
  const { dispatch } = useOrder();
  const [_, setIsInitialLoad] = useState(true);
  const isTemporary = currentOrder?.esTemporal ?? orderId <= 0;

  const handleAPIOperation = useCallback(
    async <T>(operation: () => Promise<T>, errorMessage: string) => {
      try {
        const result = await operation();
        return result;
      } catch (error) {
        const errorDetail = error instanceof Error ? error.message : 'Unknown error';
        Alert.alert('Error', `${errorMessage}: ${errorDetail}`);
        throw error;
      }
    },
    []
  );

  const loadOrder = useCallback(async () => {
    if (isTemporary) {
      const tempOrder = temporaryOrderService.getTemporaryOrder(orderId);
      if (tempOrder) {
        dispatch({ type: 'SET_ORDER', payload: tempOrder });
        dispatch({ type: 'SET_ORDER_DETAILS', payload: tempOrder.detalles || [] });
      }
    } else {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const order = await orderService.getOrder(orderId);
        const details = await orderService.getOrderDetails(orderId);
        dispatch({ type: 'SET_ORDER', payload: order });
        dispatch({ type: 'SET_ORDER_DETAILS', payload: details });
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: error instanceof Error ? error.message : 'Unknown error',
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
        setIsInitialLoad(false);
      }
    }
  }, [orderId, dispatch, isTemporary]);

  const addToOrder = useCallback(
    async (product: Product, quantity: number = 1) => {
      const newDetail: OrderDetail = {
        cantidad: quantity,
        nombreProducto: product.nombre,
        costoUnitario: product.costo,
        idOrden: orderId,
        idOrdenDetalle: uuidEntero(),
        idProducto: product.identificador,
        impuestoProducto: product.impuesto ?? 0,
      };

      if (isTemporary) {
        const tempOrder = temporaryOrderService.getTemporaryOrder(orderId);
        if (!tempOrder) {
          throw new Error('No se encontró la orden temporal');
        }
        const updatedOrder = temporaryOrderService.addOrderDetail(orderId, newDetail);
        if (updatedOrder) {
          dispatch({ type: 'SET_ORDER', payload: updatedOrder });
          dispatch({ type: 'SET_ORDER_DETAILS', payload: updatedOrder.detalles || [] });
        }
        return updatedOrder?.detalles;
      } else {
        const updatedDetails = await orderService.addProduct(orderId, newDetail);
        dispatch({ type: 'SET_ORDER_DETAILS', payload: updatedDetails });
        return updatedDetails;
      }
    },
    [orderId, dispatch, isTemporary]
  );

  const removeProduct = useCallback(
    (detailId: number) => {
      Alert.alert('Eliminar Producto', '¿Estás seguro?', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            if (isTemporary) {
              const updatedOrder = temporaryOrderService.removeOrderDetail(orderId, detailId);
              if (updatedOrder) {
                dispatch({ type: 'SET_ORDER', payload: updatedOrder });
                dispatch({ type: 'SET_ORDER_DETAILS', payload: updatedOrder.detalles || [] });
              }
            } else {
              await orderService.removeProduct(orderId, detailId);
              const updatedDetails = await orderService.getOrderDetails(orderId);
              dispatch({ type: 'SET_ORDER_DETAILS', payload: updatedDetails });
            }
          },
        },
      ]);
    },
    [orderId, dispatch, isTemporary]
  );

  const updateQuantity = useCallback(
    async (productId: number, quantity: number) => {
      if (isTemporary) {
        const tempOrder = temporaryOrderService.getTemporaryOrder(orderId);
        if (!tempOrder || !tempOrder.detalles) return;
        const detail = tempOrder.detalles.find((d) => d.idProducto === productId);
        if (detail) {
          const updatedOrder = temporaryOrderService.updateOrderDetail(
            orderId,
            detail.idOrdenDetalle,
            { cantidad: quantity }
          );
          if (updatedOrder) {
            dispatch({ type: 'SET_ORDER', payload: updatedOrder });
            dispatch({ type: 'SET_ORDER_DETAILS', payload: updatedOrder.detalles || [] });
          }
        }
      } else {
        await orderService.updateProductQuantity(orderId, productId, quantity);
        const updatedDetails = await orderService.getOrderDetails(orderId);
        dispatch({ type: 'SET_ORDER_DETAILS', payload: updatedDetails });
        const updatedOrder = await orderService.getOrder(orderId);
        dispatch({ type: 'SET_ORDER', payload: updatedOrder });
      }
    },
    [orderId, dispatch, isTemporary]
  );

  const updateOrder = useCallback(
    async (order: Order) => {
      if (isTemporary) {
        const updatedOrder = temporaryOrderService.getTemporaryOrder(orderId);
        if (updatedOrder) {
          dispatch({ type: 'SET_ORDER', payload: { ...updatedOrder, ...order } });
          dispatch({ type: 'SET_ORDER_DETAILS', payload: updatedOrder.detalles || [] });
        }
      } else {
        const savedOrder = await orderService.saveOrder(order);
        dispatch({ type: 'SET_ORDER', payload: savedOrder });
      }
    },
    [orderId, dispatch, isTemporary]
  );

  const saveOrder = useCallback(async () => {
    if (!currentOrder) return;

    return handleAPIOperation(async () => {
      let savedOrder: Order | undefined;

      if (isTemporary) {
        // Sincronizar órdenes temporales con el servidor
        await firstValueFrom(temporaryOrderService.syncTemporaryOrders());
        // Obtener la orden temporal actualizada (puede que ya no exista localmente tras la sincronización)
        const tempOrder = temporaryOrderService.getTemporaryOrder(orderId);
        if (tempOrder) {
          // Si aún está localmente, usarla; de lo contrario, recargar desde el servidor
          savedOrder = tempOrder;
        } else {
          // Asumimos que la orden temporal se convirtió en persistente; recargar desde el servidor
          savedOrder = await orderService.getOrder(orderId);
        }
      } else {
        // Sincronizar órdenes persistentes con el servidor
        await firstValueFrom(orderService.syncOrders());
        savedOrder = await orderService.getOrder(orderId);
      }

      if (savedOrder) {
        dispatch({ type: 'SET_ORDER', payload: savedOrder });
        dispatch({ type: 'SET_ORDER_DETAILS', payload: savedOrder.detalles || [] });
      } else {
        throw new Error('No se pudo recuperar la orden después de guardar');
      }

      return savedOrder;
    }, isTemporary ? 'Error sincronizando orden temporal' : 'Error guardando orden');
  }, [currentOrder, handleAPIOperation, dispatch, orderId, isTemporary]);

  const clearCurrentOrder = useCallback(() => {
    if (isTemporary) {
      temporaryOrderService.removeTemporaryOrder(orderId);
    }
    dispatch({ type: 'RESET_ORDER' });
  }, [dispatch, orderId, isTemporary]);

  const temporaryRemoveOrderDetail = useCallback(
    async (detailId: number) => {
      if (isTemporary) {
        const updatedOrder = temporaryOrderService.removeOrderDetail(orderId, detailId);
        if (updatedOrder) {
          dispatch({ type: 'SET_ORDER', payload: updatedOrder });
          dispatch({ type: 'SET_ORDER_DETAILS', payload: updatedOrder.detalles || [] });
        }
      } else {
        const updatedDetails = await orderService.temporaryRemoveOrderDetail(orderId, detailId);
        dispatch({ type: 'SET_ORDER_DETAILS', payload: updatedDetails });
      }
    },
    [dispatch, orderId, isTemporary]
  );

  return {
    removeProduct,
    updateOrder,
    saveOrder,
    updateQuantity,
    clearCurrentOrder,
    temporaryRemoveOrderDetail,
    addToOrder,
    loadOrder,
  };
};