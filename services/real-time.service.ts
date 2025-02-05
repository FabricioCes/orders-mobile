import { HubConnectionBuilder } from "@microsoft/signalr";
import { notificationService } from "./notification.service";
import { Order } from "@/types/types";

const connection = new HubConnectionBuilder()
  .withUrl("/MesasNotificaciones")
  .withAutomaticReconnect()
  .build();

connection.on("OrderUpdated", async (ordenId, nuevoEstado) => {
  notificationService.sendNotification(
    "Orden Actualizada",
    `La orden #${ordenId} ha sido modificada.`
  );
});

export const signalRService = {
  start: async () => {
    await connection.start();
  },
  onOrderUpdated: (callback: (ordenId: number, nuevoEstado:Order) => void) => {
    connection.on("OrderUpdated", callback);
  },
};
