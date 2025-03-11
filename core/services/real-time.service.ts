// signalR.service.ts
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel
} from '@microsoft/signalr'
import { getBaseUrl } from './config'

class SignalRService {
  private connection: HubConnection | null = null
  private orderUpdatedListeners: Array<() => void> = []

  constructor () {
    this.initializeConnection()
  }

  private async initializeConnection () {
    const baseUrl = await getBaseUrl()
    this.connection = new HubConnectionBuilder()
      .withUrl(`${baseUrl}/MesasNotificaciones`)
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build()

    this.connection.on('OrderUpdated', () => {
      this.notifyOrderUpdated()
    })

    this.startConnection()
  }

  private async startConnection () {
    try {
      if (this.connection?.state === 'Disconnected') {
        await this.connection.start()
      }
    } catch (error) {
      console.error('Error al conectar SignalR:', error)
    }
  }

  // Método para suscribirse a actualizaciones
  public onOrderUpdated (callback: () => void): () => void {
    this.orderUpdatedListeners.push(callback)

    // Devuelve función para desuscribirse
    return () => {
      this.orderUpdatedListeners = this.orderUpdatedListeners.filter(
        listener => listener !== callback
      )
    }
  }

  private notifyOrderUpdated () {
    this.orderUpdatedListeners.forEach(callback => callback())
  }
}

export const signalRService = new SignalRService()
