import { useSettings } from '@/context/SettingsContext';
import { Client } from '@/types/clientTypes'
import {
  Order,
  OrderDetail,
} from '@/types/types'

interface ApiResponse<T> {
  CodigoRespuesta: number
  Resultado: T
  Mensaje?: string
  Error?: boolean
}

function getBaseUrl() {
  const { settings } = useSettings()
  return `http://${settings?.idComputadora}:5001`
};

async function handleResponse<T> (response: Response): Promise<T> {
  const data: ApiResponse<T> = await response.json()

  if (!response.ok) {
    throw new Error(data.Mensaje || `HTTP error! status: ${response.status}`)
  }

  if (data.Error) {
    throw new Error(data.Mensaje || 'API returned an error')
  }

  return data.Resultado
}

export const orderRepository = {
  async getOrderIdByTable (zona: string, mesa: string): Promise<number> {
    const response = await fetch(`${getBaseUrl()}/${zona.toUpperCase()}/${mesa}`)
    return handleResponse<number>(response)
  },

  async getClientByOrderId (orderId: number): Promise<Client> {
    const response = await fetch(`${getBaseUrl()}/${orderId}/cliente`)
    return handleResponse<Client>(response)
  },

  async getActiveTables (): Promise<Order[]> {
    const response = await fetch(`${getBaseUrl()}/activa`)
    return handleResponse<Order[]>(response)
  },

  async getOrderDetails (orderId: number): Promise<OrderDetail[]> {
    const response = await fetch(`${getBaseUrl()}/${orderId}/detalle`)
    return handleResponse<OrderDetail[]>(response)
  },

  async createOrder (request: Order): Promise<number> {
    if (!request.detalles || request.detalles.length === 0) {
      throw new Error('La orden debe contener al menos un detalle')
    }

    const response = await fetch(getBaseUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    })

    return handleResponse<number>(response)
  },

  async updateOrder (request: Order): Promise<void> {
    const response = await fetch(getBaseUrl(), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    })

    await handleResponse<void>(response)
  },

  async deleteOrderDetail (detailId: number): Promise<void> {
    const response = await fetch(`${getBaseUrl()}/detalle/${detailId}`, {
      method: 'DELETE'
    })

    await handleResponse<void>(response)
  }
}
