import { useOrderState } from './useOrderState'
import { useOrderOperations } from './useOrderOperations'
import { useProductManagement } from './useProductManagement'
import { useProducts } from '@/context/ProductsContext'
import { useEffect } from 'react'
import { orderService } from '@/core/services/order.service'

export const useOrderManagement = (
  orderId: number,
  userName: string,
  token: string,
  zona: string
) => {
  const {
    order,
    activeTables,
    details: orderDetails,
    loading,
    error
  } = useOrderState(orderId, userName, token, zona)
  const { loading: productsLoading, error: productsError } = useProducts()

  const { addToOrder } = useProductManagement(orderId)

  const {
    removeProduct,
    updateOrder,
    saveOrder,
    updateQuantity,
    clearCurrentOrder
  } = useOrderOperations(orderId, order!)

  useEffect(() => {
    if (orderId && !order) {
      orderService.getOrder$(orderId).subscribe()
    }
  }, [orderId, order])

  return {
    order,
    activeTables,
    orderDetails,
    loading,
    error,
    productsLoading,
    productsError,
    removeProduct,
    updateOrder,
    saveOrder,
    addToOrder,
    updateQuantity,
    clearCurrentOrder
  }
}
