import { getBaseUrl } from '@/core/services/config'
import { TableCount } from '@/types/tableTypes'
import { ApiResponse } from '@/types/types'

import { getToken } from '@/utils/tableUtils'

export class ParamApiRepository {
  private static async handleRequest<T> (
    endpoint: string,
    init?: RequestInit
  ): Promise<T> {
    let token: string | null = ''

    try {
      token = await getToken()
      if (!token) {
        throw new Error(
          'No se encontró un token válido. Inicie sesión nuevamente.'
        )
      }
    } catch (err) {
      console.log(err)
    }

    const headers: HeadersInit = {
      ...init?.headers,
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
    const response = await fetch(`${await getBaseUrl()}/${endpoint}`, {
      ...init,
      headers
    })

    const data: ApiResponse<T> = await response.json()

    if (data.error) {
      throw new Error(data.mensaje || 'Error en la respuesta de la API', {
        cause: data.tipoError
      })
    }

    return data.resultado
  }

  static async getTablesByLocation (): Promise<TableCount> {
    try {
      const result = await this.handleRequest<TableCount>('Parametro/cantidad/mesas')
      return result
    } catch (error) {
      throw new Error(
        'No se pudo obtener el total de mesas por ubicacion: ' +
          (error as Error).message
      )
    }
  }
}
