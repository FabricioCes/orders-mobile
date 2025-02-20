
import { useCallback } from 'react';
import { Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Order } from '@/types/types';
import { orderService } from '@/core/services/order.service';
import { useOrder } from '../context/OrderContext';
import { Product } from '@/types/productTypes';
import { uuidEntero } from '@/utils/uuidUtils';

export const useOrderOperations = (orderId: number, order: Order) => {
  const { dispatch } = useOrder();
  const handleModifyOrder = useCallback(
    async (action: () => Promise<void>, errorMessage: string) => {
      try {
        await action();
      } catch (error) {
        Alert.alert('Error', errorMessage);
        throw error;
      }
    },
    []
  );

  const addToOrder = useCallback(
    async (product: Product, quantity: number = 1) => {
      const orderDetail = {
        cantidad: quantity,
        nombreProducto: product.nombre,
        precio: product.precio,
        costoUnitario: product.costo,
        identificadorOrden: orderId,
        identificadorOrdenDetalle: uuidEntero(),
        identificadorProducto: product.identificador,
        impuestoProducto: product.impuesto ?? 0
      }

      try {
        const result = await orderService.addProduct(orderId, orderDetail)
        return result
      } catch (error) {
        console.log('Error adding product:', error)
        throw error
      }
    },
    [orderId]
  )

  const removeProduct = useCallback(
    (detailId: number) => {
      Alert.alert('Eliminar Producto', '¿Estás seguro?', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => handleModifyOrder(
            () => orderService.removeProduct(orderId, detailId),
            'Error al eliminar producto'
          )
        }
      ]);
    },
    [handleModifyOrder, orderId]
  );


  const updateQuantity = useCallback(
    (productId: number, quantity: number) => {
      handleModifyOrder(
        () => orderService.updateProductQuantity(orderId, productId, quantity),
        'Error al actualizar la cantidad'
      );
    },
    [handleModifyOrder, orderId]
  );

  const updateOrder = useCallback(
    (order: Order) => handleModifyOrder(
      () => orderService.saveOrder(order),
      'Error al actualizar la orden'
    ),
    [handleModifyOrder]
  );

  const saveOrder = useCallback(async () => {
    const netState = await NetInfo.fetch();

    if (!netState.isConnected) {
      Alert.alert(
        'Sin conexión',
        'La orden se guardará cuando se restablezca la conexión'
      );
      return;
    }

    Alert.alert('Guardar Orden', '¿Deseas guardar esta orden?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Guardar',
        onPress: () => handleModifyOrder(
          () => {
            const result = orderService.saveOrder(order)
            Alert.alert('Éxito', 'Orden guardada correctamente');
            return result;

          },
          'Error al guardar la orden'
        )
      }
    ]);
  }, [handleModifyOrder, orderId, order]);

  const clearCurrentOrder = () => orderService.clearCurrentOrder()

  const temporaryRemoveOrderDetail = useCallback((detailId: number) => {

    orderService.temporaryRemoveOrderDetail(detailId);

    dispatch({ type: "REMOVE_ORDER_DETAIL", payload: detailId });
  }, [dispatch]);

  return { removeProduct, updateOrder, saveOrder, updateQuantity, clearCurrentOrder,temporaryRemoveOrderDetail, addToOrder };
};