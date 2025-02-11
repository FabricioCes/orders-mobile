import AsyncStorage from "@react-native-async-storage/async-storage";
import { orderService } from "./order.service";
import { Order } from "@/types/types";

export const offlineService = {
  async saveOfflineOrder(orderId: number, order: Order) {
    await AsyncStorage.setItem(`offline_order_${orderId}`, JSON.stringify(order));
  },

  async getOfflineOrder(orderId: number) {
    const data = await AsyncStorage.getItem(`offline_order_${orderId}`);
    return data ? JSON.parse(data) : null;
  },

  async syncPendingOrders() {
    const keys = await AsyncStorage.getAllKeys();
    const offlineOrders = keys.filter((key) => key.startsWith("offline_order_"));

    for (let key of offlineOrders) {
      const orderId = key.split("_")[2];
      const orderData = await AsyncStorage.getItem(key);

      if (orderData) {
        try {
          const order = JSON.parse(orderData);
          await orderService.saveOrder(order); // Enviar al servidor
          await AsyncStorage.removeItem(key); // Eliminar de la caché
        } catch (error) {
          console.error(`Error sincronizando orden #${orderId}`, error);
        }
      }
    }
  },
  async removeOfflineOrder(orderId: number) {
    try {
      await AsyncStorage.removeItem(`offline_order_${orderId}`);
      console.log(`Orden #${orderId} eliminada correctamente.`);
    } catch (error) {
      console.error(`Error eliminando orden #${orderId}:`, error);
    }
  },
};
