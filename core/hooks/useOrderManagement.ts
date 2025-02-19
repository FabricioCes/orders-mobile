import { useOrderState } from './useOrderState'
import { useOrderOperations } from './useOrderOperations'
import { useProducts } from '@/core/context/ProductsContext'
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
  zona: string,
  isTemp: boolean = false
) => {

  console.log(isTemp, "Es Temporal")
  const {
    order,
    activeTables,
    details: orderDetails,
    loading,
    error
  } = useOrderState(orderId, userName, token, zona, isTemp)
  const { loading: productsLoading, error: productsError } = useProducts()

  const unmount$ = new Subject<void>();
  const {
    removeProduct,
    updateOrder,
    saveOrder,
    updateQuantity,
    clearCurrentOrder,
    temporaryRemoveOrderDetail,
    addToOrder
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
    console.log(order)
    if (orderId === 0 && !order) {
      orderService
        .createTemporaryOrder(numeroMesa, zona)
        .pipe(takeUntil(unmount$))
        .subscribe({
          next: newOrder => {
            router.setParams({ orderId: String(newOrder.numeroOrden) })
          },
          error: err => console.log(err)
        })
    }
  }


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
    clearCurrentOrder,
    createNewOrder,
    temporaryRemoveOrderDetail
  }
}
