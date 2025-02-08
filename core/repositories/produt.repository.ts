import { getBaseUrl } from '@/core/services/config'
import { Category, Product } from '@/types/productTypes'
import { ApiResponse } from '@/types/types'
import { getToken } from '@/utils/tableUtils'

export class ProductApiRepository {
  private static async handleRequest<T>(
    endpoint: string,
    init?: RequestInit
  ): Promise<T> {
    const token = await getToken()

    if (!token) {
      throw new Error(
        'No se encontró un token válido. Inicie sesión nuevamente.'
      )
    }

    const headers = {
      ...init?.headers,
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }

    console.log(`${await getBaseUrl()}/${endpoint}`)
    try {
      const response = await fetch(`${await getBaseUrl()}/${endpoint}`, {
        ...init,
        headers
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ApiResponse<T> = await response.json()
      if (data.error) {
        throw new Error(data.mensaje || 'Error en la respuesta de la API')
      }
      return data.resultado
    } catch (error) {
      console.log('Error in handleRequest:', error)
      throw new Error(
        'Error al procesar la solicitud: ' + (error as Error).message
      )
    }
  }

  static async getCategories(): Promise<Category[]> {
    try {
      const result = await this.handleRequest<Category[]>('Producto/categorias')
      return result
    } catch (error) {
      throw new Error(
        'No se pudieron obtener las categorías: ' + (error as Error).message
      )
    }
  }

  static async getProductsByCategory(categoriaId: number): Promise<Product[]> {
    try {
      const resultado = await this.handleRequest<Product[]>(`Producto/categoria/${categoriaId}`)
      return resultado
    } catch (error) {
      console.error('Error al cargar productos por categoría:', error)
      throw error
    }
  }

  static async searchProducts(query: string): Promise<Product[]> {
    try {
      console.log("Search")
      const resultado = await this.handleRequest<Product[]>(`Producto/buscar/${query}`)
      return resultado
    } catch (error) {
      console.error('Error al buscar productos:', error)
      throw error
    }
  }

  static async getProductsBySubSubCategory(subSubCategory: string): Promise<Product[]> {
    try {
      const endpoint = `producto/categoria/${encodeURIComponent(subSubCategory)}`
      const resultado = await this.handleRequest<Product[]>(endpoint)
      return resultado
    } catch (error) {
      console.error('Error al cargar productos por subsubcategoría:', error)
      throw error
    }
  }
}
