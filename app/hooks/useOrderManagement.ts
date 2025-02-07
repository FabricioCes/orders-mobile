import { useOrderState } from './useOrderState'
import { useOrderOperations } from './useOrderOperations'
import { useProductManagement } from './useProductManagement'
import { useProducts } from '@/context/ProductsContext'
import { useEffect, useState } from 'react'
import { orderService } from '@/core/services/order.service'


export const useOrderManagement = (orderId: number, userName: string, token: string, zona: string) => {
  const {
    order,
    activeTables,
    details: orderDetails,
    loading,
    error
  } = useOrderState(orderId, userName, token, zona)
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

  const { removeProduct, updateOrder, saveOrder, updateQuantity, clearCurrentOrder} = useOrderOperations(
    orderId,
    order!
  )


  useEffect(() => {
    if (orderId && !order) {
      orderService.getOrder$(orderId).subscribe();
    }
  }, [orderId, order]);

  return {
    order,
    activeTables,
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
    updateQuantity,
    clearCurrentOrder
  }
}
