import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { notificationService } from './notification.service';
import { Order } from '@/types/types';
import { getBaseUrl } from './config';

let connection: HubConnection;

const initConnection = async (): Promise<void> => {
  const baseUrl = await getBaseUrl();

  connection = new HubConnectionBuilder()
    .withUrl(`${baseUrl}/MesasNotificaciones`) // Asegúrate que coincida con el endpoint del Hub en el backend
    .withAutomaticReconnect()
    .build();

  // Configura los listeners después de crear la conexión
  connection.on('EstadoOrdenActualizado', (ordenId: number) => {
    notificationService.sendNotification(
      'Orden Actualizada',
      `La orden #${ordenId} ha sido modificada.`
    );
  });
};

export const signalRService = {
  start: async (): Promise<void> => {
    if (!connection) {
      await initConnection(); // Espera a que la conexión se inicialice
    }
    try {
      await connection.start();
      console.log('SignalR Connected');
    } catch (err) {
      console.error('Error al conectar con SignalR:', err);
    }
  },
  onOrderUpdated: (callback: (ordenId: number, nuevoEstado: Order) => void): void => {
    if (connection) {
      connection.on('EstadoOrdenActualizado', callback); // Nombre del evento debe coincidir con el backend
    }
  },
};