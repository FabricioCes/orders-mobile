// src/hooks/useProductManagement.ts
import { useMemo, useCallback } from 'react'
import { orderService } from '@/services/order.service'
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
        nameLC: product.name.toLowerCase()
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
        idProducto: product.id,
        cantidad: quantity,
        identificadorOrdenDetalle: Date.now(),
        nombreProducto: product.name,
        precio: product.price,
        porcentajeDescProducto: product.discountPercentage || 0,
        ingrediente: false,
        quitarIngrediente: false
      }

      await orderService.addProduct(orderId, orderDetail)
    },
    [orderId]
  )

  return { filteredMenu, addToOrder }
}
