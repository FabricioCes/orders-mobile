import { useOrderState } from './useOrderState'
import { useOrderOperations } from './useOrderOperations'
import { useProductManagement } from './useProductManagement'
import { useProducts } from '@/context/ProductsContext'
import { useEffect } from 'react'
import { orderService } from '@/core/services/order.service'
import { Subject, takeUntil } from 'rxjs'
import { router } from 'expo-router'

export const useOrderManagement = (
  orderId: number,
  userName: string,
  token: string,
  isActive: boolean,
  numeroMesa: string,
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
  const unmount$ = new Subject<void>();
  const {
    removeProduct,
    updateOrder,
    saveOrder,
    updateQuantity,
    clearCurrentOrder
  } = useOrderOperations(orderId, order!)

  useEffect(() => {
    const sub = orderService.activeTables$.subscribe()
    return () => {
      sub.unsubscribe()
      unmount$.next();   // Emitir un valor para notificar el desmontaje
      unmount$.complete(); // Completar el Subject
    }
  }, [])

  const createNewOrder = () => {
    if (orderId === 0 && !order) {
      orderService
        .createTemporaryOrder(numeroMesa, zona)
        .pipe(takeUntil(unmount$))
        .subscribe({
          next: newOrder => {
            router.setParams({ orderId: String(newOrder.numeroOrden) })
          },
          error: err => console.error(err)
        })
    }
  }

  useEffect(() => {
    createNewOrder()
  }, [numeroMesa, zona])

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
