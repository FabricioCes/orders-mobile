import AsyncStorage from "@react-native-async-storage/async-storage";
import { orderService } from "./order.service";

export const offlineService = {
  async saveOfflineOrder(orderId: number, details: any) {
    await AsyncStorage.setItem(`offline_order_${orderId}`, JSON.stringify(details));
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
};
