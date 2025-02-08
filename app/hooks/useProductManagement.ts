// src/hooks/useProductManagement.ts
import { useCallback } from 'react'
import { orderService } from '@/core/services/order.service'
import { Product } from '@/types/productTypes'

export const useProductManagement = (
  searchQuery: string,
  orderId: number
) => {



  const addToOrder = useCallback(
    async (product: Product, quantity: number = 1) => {
      const orderDetail = {
        cantidad: quantity,
        nombreProducto: product.nombre,
        precio: product.precio,
        costoUnitario: product.costo,
        identificadorOrden: orderId,
        identificadorOrdenDetalle: Date.now(),
        identificadorProducto: product.identificador,
        impuestoProducto: product.impuesto ?? 0
      }

      try {
        const result = await orderService.addProduct(orderId, orderDetail)
        return result
      } catch (error) {
        console.error('Error adding product:', error)
        throw error
      }
    },
    [orderId]
  )

  return { addToOrder }
}
