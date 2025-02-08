
import { useCallback } from 'react';
import { Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Order } from '@/types/types';
import { orderService } from '@/core/services/order.service';
import { offlineService } from '@/core/services/offlineService';

export const useOrderOperations = (orderId: number, order: Order) => {
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
      await offlineService.saveOfflineOrder(orderId, order);
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

  return { removeProduct, updateOrder, saveOrder, updateQuantity, clearCurrentOrder };
};