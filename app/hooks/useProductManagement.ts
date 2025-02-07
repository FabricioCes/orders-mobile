// src/hooks/useProductManagement.ts
import { useMemo, useCallback } from 'react'
import { orderService } from '@/core/services/order.service'
import { Product, ProductGroup } from '@/types/productTypes'

export const useProductManagement = (
  groupedProducts: ProductGroup[],
  searchQuery: string,
  orderId: number
) => {
  const processedGroupedProducts = groupedProducts.map(group => ({
    ...group,
    subCategories: group.subCategories.map(sub => ({
      ...sub,
      nameLC: sub.name.toLowerCase(),
      products: sub.products.map(product => ({
        ...product,
        nameLC: (product.nombre || '').toLowerCase()
      }))
    }))
  }))
  const filteredMenu = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return processedGroupedProducts

    return processedGroupedProducts.filter(group =>
      group.subCategories.some(
        sub =>
          sub.nameLC.includes(query) ||
          sub.products.some(p => p.nameLC.includes(query))
      )
    )
  }, [processedGroupedProducts, searchQuery])

  const addToOrder = useCallback(
    async (product: Product, quantity: number = 1) => {
      const orderDetail = {
        cantidad: quantity,
        nombreProducto: product.nombre,
        precio: product.precio,
        costoUnitario: product.costo,
        identificadorOrden: orderId,
        identificadorOrdenDetalle: 0,
        identificadorProducto: product.identificador,
        impuestoProducto: product.impuesto ?? 0
      }

      await orderService.addProduct(orderId, orderDetail)
    },
    [orderId]
  )

  return { filteredMenu, addToOrder }
}
