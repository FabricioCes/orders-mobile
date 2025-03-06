import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr'
import { notificationService } from './notification.service'
import { Order } from '@/types/types'
import { getBaseUrl } from './config'

let connection: HubConnection
let reconnectedCallbacks: (() => void)[] = []
let connectionStatusCallbacks: ((
  state: 'Connected' | 'Reconnecting' | 'Disconnected'
) => void)[] = []
let reconnectionFailedCallbacks: ((error?: Error) => void)[] = []
let isReconnecting = false

const initConnection = async (): Promise<void> => {
  const baseUrl = await getBaseUrl()

  connection = new HubConnectionBuilder()
    .withUrl(`${baseUrl}/MesasNotificaciones`)
    .withAutomaticReconnect()
    .build()

  // Event handlers
  connection.onreconnecting(() => {
    isReconnecting = true
    connectionStatusCallbacks.forEach(cb => cb('Reconnecting'))
  })

  connection.onreconnected(() => {
    isReconnecting = false
    connectionStatusCallbacks.forEach(cb => cb('Connected'))
    reconnectedCallbacks.forEach(cb => cb())
  })

  connection.onclose(error => {
    if (isReconnecting && error) {
      reconnectionFailedCallbacks.forEach(cb => cb(error))
      notificationService.sendNotification(
        'Error de conexión',
        'No se pudo reconectar al servidor'
      )
    }

    if (error && !isReconnecting) {
      notificationService.sendNotification(
        'Desconectado',
        'Se perdió la conexión con el servidor'
      )
    }

    isReconnecting = false
    connectionStatusCallbacks.forEach(cb => cb('Disconnected'))
  })

  connection.on('CambioEstadoOrden', (ordenId: number) => {
    notificationService.sendNotification(
      'Orden Actualizada',
      `La orden #${ordenId} ha sido modificada.`
    )
  })
}

export const signalRService = {
  start: async (): Promise<void> => {
    if (!connection) {
      await initConnection()
    }
    try {
      await connection.start()
      console.log('SignalR Connected')
      connectionStatusCallbacks.forEach(cb => cb('Connected'))
    } catch (err) {
      console.log('Error al conectar con SignalR:', err)
      connectionStatusCallbacks.forEach(cb => cb('Disconnected'))
    }
  },

  stop: async (): Promise<void> => {
    if (connection) {
      await connection.stop()
      console.log('SignalR Disconnected')
    }
  },

  onOrderUpdated: (
    callback: (ordenId: number, nuevoEstado: Order | string) => void
  ): void => {
    connection?.on('CambioEstadoOrden', callback)
  },

  onReconnected: (callback: () => void) => {
    reconnectedCallbacks.push(callback)
  },

  offReconnected: (callback: () => void) => {
    reconnectedCallbacks = reconnectedCallbacks.filter(cb => cb !== callback)
  },

  onConnectionStatusChanged: (callback: (state: string) => void) => {
    connectionStatusCallbacks.push(callback)
  },

  offConnectionStatusChanged: (callback: (state: string) => void) => {
    connectionStatusCallbacks = connectionStatusCallbacks.filter(
      cb => cb !== callback
    )
  },

  onReconnectionFailed: (callback: (error?: Error) => void) => {
    reconnectionFailedCallbacks.push(callback)
  },

  offReconnectionFailed: (callback: (error?: Error) => void) => {
    reconnectionFailedCallbacks = reconnectionFailedCallbacks.filter(
      cb => cb !== callback
    )
  }
}
