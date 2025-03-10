import { useCallback, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { ApiResponse, Order, OrderDetail } from '@/types/types';
import { orderService } from '@/core/services/order.service';
import { temporaryOrderService } from '@/core/services/temporary_order.service';
import { useOrder } from '../context/OrderContext';
import { Product } from '@/types/productTypes';
import { uuidEntero } from '@/utils/uuidUtils';
import { firstValueFrom } from 'rxjs';
import { router } from 'expo-router';
import { useOrderUpdater } from './useGetSaveOptions';
import { useCustomer } from '../context/CustomerContext';

export const useOrderOperations = (orderId: number) => {
  const { state, dispatch } = useOrder();
  const { state: customerState } = useCustomer();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { getSaveOptions } = useOrderUpdater();

  const isTemporary = state.order?.esTemporal ?? false;

  const handleAPIOperation = useCallback(
    async <T>(operation: () => Promise<T>, errorMessage: string) => {
      const result = await operation();
      if (result && typeof result === 'object' && 'codigoRespuesta' in result) {
        const apiResponse = result as unknown as ApiResponse<any>;
        if (apiResponse.error) {
          throw new Error(apiResponse.mensaje || errorMessage);
        }
      }
      return result;
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
        orderService.clearLocalOrders();
        const order = await orderService.getOrder(orderId);
        const details = await orderService.getOrderDetails(orderId);
        dispatch({ type: 'SET_ORDER', payload: order });
        dispatch({ type: 'SET_ORDER_DETAILS', payload: details });
        router.setParams({
          orderId: order.numeroOrden?.toString(),
          tableId: order.numeroMesa?.toString() ?? '0',
          place: order.ubicacion,
        });
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: error instanceof Error ? error.message : 'Unknown error',
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
        setIsInitialLoad(false); // Marcamos que la carga inicial ha terminado
        dispatch({ type: 'SET_UNSAVED_CHANGES', payload: false }); // Reiniciamos cambios tras cargar
      }
    }
  }, [orderId, dispatch, isTemporary]);

  const reloadOriginalOrder = useCallback(async () => {
    if (isTemporary) {
      const tempOrder = temporaryOrderService.getTemporaryOrder(orderId);
      if (tempOrder) {
        dispatch({ type: 'SET_ORDER', payload: tempOrder });
        dispatch({ type: 'SET_ORDER_DETAILS', payload: tempOrder.detalles || [] });
      } else {
        dispatch({ type: 'RESET_ORDER' });
      }
    } else {
      await loadOrder();
    }
    dispatch({ type: 'SET_UNSAVED_CHANGES', payload: false });
  }, [orderId, dispatch, isTemporary, loadOrder]);

  const addToOrder = useCallback(
    async (product: Product, quantity: number = 1) => {
      if (!state.order) return;
      console.log('Add to Order');
      const newDetail: OrderDetail = {
        cantidad: quantity,
        nombreProducto: product.nombre,
        costoUnitario: product.costo,
        idOrden: orderId,
        idOrdenDetalle: uuidEntero(),
        idProducto: product.identificador,
        impuestoProducto: product.impuesto ?? 0,
        adicionales: [],
      };

      if (isTemporary) {
        const updatedOrder = temporaryOrderService.addOrderDetail(orderId, newDetail);
        if (updatedOrder) {
          dispatch({ type: 'SET_ORDER', payload: updatedOrder });
          dispatch({ type: 'SET_ORDER_DETAILS', payload: updatedOrder.detalles || [] });
          console.log('hasunsavedchanges');
          dispatch({ type: 'SET_UNSAVED_CHANGES', payload: true });
        }
        return updatedOrder?.detalles;
      } else {
        console.log('Aqui////////////');
        const updatedDetails = await orderService.addProduct(orderId, newDetail);
        dispatch({ type: 'SET_ORDER_DETAILS', payload: updatedDetails });
        console.log(updatedDetails);
        console.log('hasunsavedchanges');
        dispatch({ type: 'SET_UNSAVED_CHANGES', payload: true });
        return updatedDetails;
      }
    },
    [orderId, dispatch, isTemporary, state.order]
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
                dispatch({ type: 'SET_UNSAVED_CHANGES', payload: true });
              }
            } else {
              await orderService.removeProduct(orderId, detailId);
              const updatedDetails = await orderService.getOrderDetails(orderId);
              dispatch({ type: 'SET_ORDER_DETAILS', payload: updatedDetails });
              dispatch({ type: 'SET_UNSAVED_CHANGES', payload: true });
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
          const updatedOrder = temporaryOrderService.updateOrderDetail(orderId, detail.idOrdenDetalle, { cantidad: quantity });
          if (updatedOrder) {
            dispatch({ type: 'SET_ORDER', payload: updatedOrder });
            dispatch({ type: 'SET_ORDER_DETAILS', payload: updatedOrder.detalles || [] });
            dispatch({ type: 'SET_UNSAVED_CHANGES', payload: true });
          }
        }
      } else {
        await orderService.updateProductQuantity(orderId, productId, quantity);
        const updatedDetails = await orderService.getOrderDetails(orderId);
        dispatch({ type: 'SET_ORDER_DETAILS', payload: updatedDetails });
        const updatedOrder = await orderService.getOrder(orderId);
        dispatch({ type: 'SET_ORDER', payload: updatedOrder });
        dispatch({ type: 'SET_UNSAVED_CHANGES', payload: true });
      }
    },
    [orderId, dispatch, isTemporary]
  );

  const updateOrderState = async (orderIdToUse: number): Promise<Order> => {
    const savedOrder = await orderService.getOrder(orderIdToUse);
    if (!savedOrder) {
      throw new Error('No se pudo recuperar la orden después de guardar');
    }
    dispatch({ type: 'SET_ORDER', payload: savedOrder });
    dispatch({ type: 'SET_ORDER_DETAILS', payload: savedOrder.detalles || [] });
    dispatch({ type: 'SET_UNSAVED_CHANGES', payload: false });
    return savedOrder;
  };

  const createOrUpdateOrder = async (): Promise<Order> => {
    const currentOrder = state.order;
    if (!currentOrder) throw new Error('No hay orden actual para guardar');

    const options = await getSaveOptions(currentOrder);

    let orderIdToUse: number;

    if (currentOrder.esTemporal) {
      const syncResult = await firstValueFrom(temporaryOrderService.syncTemporaryOrder(options));
      if (!syncResult) {
        throw new Error('No se pudo encontrar la orden sincronizada');
      }
      orderIdToUse = syncResult.newOrderId;
      router.setParams({ orderId: orderIdToUse.toString() });
    } else {
      await firstValueFrom(orderService.syncOrder(currentOrder, options));
      orderIdToUse = orderId;
    }
    return updateOrderState(orderIdToUse);
  };

  const saveOrder = useCallback(async () => {
    if (!state.order) {
      Alert.alert('Error', 'No hay una orden actual para guardar');
      return;
    }
    try {
      const savedOrder = await handleAPIOperation(
        async () => createOrUpdateOrder(),
        isTemporary
          ? 'Error sincronizando orden temporal'
          : 'Error guardando orden'
      );
      return savedOrder;
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Error desconocido'
      );
      throw error;
    }
  }, [handleAPIOperation, isTemporary, state.order, customerState.selectedCustomer]);

  const clearCurrentOrder = useCallback(() => {
    if (isTemporary) {
      temporaryOrderService.removeTemporaryOrder(orderId);
    }
    dispatch({ type: 'RESET_ORDER' });
    dispatch({ type: 'SET_UNSAVED_CHANGES', payload: false });
  }, [dispatch, orderId, isTemporary]);

  // Exponemos hasUnsavedChanges directamente del estado del contexto
  const hasUnsavedChanges = state.hasUnsavedChanges;

  // Depuración del estado global hasUnsavedChanges
  useEffect(() => {
    console.log('Global hasUnsavedChanges:', hasUnsavedChanges);
  }, [hasUnsavedChanges]);

  return {
    removeProduct,
    saveOrder,
    updateQuantity,
    clearCurrentOrder,
    addToOrder,
    loadOrder,
    reloadOriginalOrder,
    hasUnsavedChanges,
  };
};