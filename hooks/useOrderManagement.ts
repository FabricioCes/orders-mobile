// src/hooks/useOrderManagement.ts
import { useOrderState } from './useOrderState'
import { useOrderOperations } from './useOrderOperations'
import { useProductManagement } from './useProductManagement'
import { useProducts } from '@/context/ProductsContext'
import { useState } from 'react'

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

  const { removeProduct, updateOrder, saveOrder } = useOrderOperations(
    orderId,
    order!
  )

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
    addToOrder
  }
}
