import { useOrderState } from './useOrderState'
import { useOrderOperations } from './useOrderOperations'
import { useProductManagement } from './useProductManagement'
import { useProducts } from '@/context/ProductsContext'
import { useEffect, useState } from 'react'
import { orderService } from '@/services/order.service'

export const useOrderManagement = (orderId: number) => {
  const {
    order,
    details: orderDetails,
    loading,
    error
  } = useOrderState(orderId)
  const {
    groupedProducts,
    loading: productsLoading,
    error: productsError
  } = useProducts()

  const [searchQuery, setSearchQuery] = useState('')

  const { filteredMenu, addToOrder } = useProductManagement(
    groupedProducts,
    searchQuery,
    orderId
  )

  const { removeProduct, updateOrder, saveOrder, updateQuantity } = useOrderOperations(
    orderId,
    order!
  )

  useEffect(() => {
    const subscription = orderService.getOrderDetails$(orderId).subscribe();
    return () => subscription.unsubscribe();
  }, [orderId]);

  return {
    order,
    orderDetails,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    filteredMenu,
    productsLoading,
    productsError,
    removeProduct,
    updateOrder,
    saveOrder,
    addToOrder,
    updateQuantity
  }
}
