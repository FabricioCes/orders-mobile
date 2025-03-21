import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { orderService } from '../services/order.service'
import { useOrder } from '../context/OrderContext'
import { Order, OrderDetail } from '@/types/types'
import { useOrderUpdater } from '@/core/hooks/useGetSaveOptions'
import { useSelectedCustomer } from '@/core/context/CustomerContext'
import { useEffect } from 'react'

export const useOrderOperations = (orderId: number) => {
  const { state, dispatch } = useOrder()
  const queryClient = useQueryClient()
  const { getSaveOptions } = useOrderUpdater()
  const { clearSelectedCustomer } = useSelectedCustomer()

  const isTemporal = orderId === 0 || state.order?.esTemporal === true
  const isOrderLoaded = state.order?.numeroOrden === orderId && !isTemporal

  console.log(
    `useOrderOperations: orderId=${orderId}, isTemporal=${isTemporal}, isOrderLoaded=${isOrderLoaded}, hasUnsavedChanges=${state.hasUnsavedChanges}`
  )
  console.log(
    `Estado actual: order=${JSON.stringify(
      state.order
    )}, details=${JSON.stringify(state.orderDetails)}`
  )

  const { data: fetchedOrder, isSuccess } = useQuery<Order, Error>({
    queryKey: ['order', orderId],
    queryFn: () => orderService.getOrder(orderId),
    enabled: orderId !== 0 && !isTemporal && !isOrderLoaded,
    staleTime: 5 * 60 * 1000
  })

  useEffect(() => {
    if (isSuccess && fetchedOrder && !state.hasUnsavedChanges) {
      console.log(
        `Cargando order desde backend: ${JSON.stringify(fetchedOrder)}`
      )
      dispatch({ type: 'SET_ORDER', payload: fetchedOrder })
    }
  }, [fetchedOrder, isSuccess, dispatch, state.hasUnsavedChanges])

  const { data: fetchedOrderDetails, isSuccess: detailsSuccess } = useQuery<
    OrderDetail[],
    Error
  >({
    queryKey: ['orderDetails', orderId],
    queryFn: () => orderService.getOrderDetails(orderId),
    enabled: orderId !== 0 && !isTemporal && !isOrderLoaded,
    staleTime: 5 * 60 * 1000
  })

  useEffect(() => {
    if (detailsSuccess && fetchedOrderDetails && !state.hasUnsavedChanges) {
      console.log(
        `Cargando orderDetails desde backend: ${JSON.stringify(
          fetchedOrderDetails
        )}`
      )
      dispatch({ type: 'SET_ORDER_DETAILS', payload: fetchedOrderDetails })
    }
  }, [fetchedOrderDetails, detailsSuccess, dispatch, state.hasUnsavedChanges])

  const syncOrderMutation = useMutation({
    mutationFn: async () => {
      if (!state.order) throw new Error('No hay orden para sincronizar')
      const options = await getSaveOptions(state.order)
      return orderService.syncOrder(state.order, options)
    },
    onSuccess: () => {
      dispatch({ type: 'SET_UNSAVED_CHANGES', payload: false })
      queryClient.invalidateQueries({ queryKey: ['order', orderId] })
      queryClient.invalidateQueries({ queryKey: ['orderDetails', orderId] })
      dispatch({ type: 'RESET_ORDER' })
      clearSelectedCustomer()
    },
    onError: error => {
      dispatch({ type: 'SET_ERROR', payload: error.message })
    }
  })

  const createTemporaryOrder = (numeroMesa: string, zona: string) => {
    dispatch({
      type: 'CREATE_TEMPORARY_ORDER',
      payload: { numeroMesa, zona, esTemporal: false }
    })
  }

  const addProduct = (product: OrderDetail) => {
    dispatch({ type: 'ADD_ORDER_DETAIL', payload: product })
  }

  const removeProduct = (detailId: number) => {
    dispatch({ type: 'REMOVE_ORDER_DETAIL', payload: detailId })
  }

  const updateQuantity = (detailId: number, quantity: number) => {
    dispatch({
      type: 'UPDATE_ORDER_DETAIL',
      payload: { detailId, updatedDetail: { cantidad: quantity } }
    })
  }

  const cleanOrder = () => dispatch({ type: 'RESET_ORDER' })

  return {
    order: state.order,
    orderDetails: state.orderDetails || [],
    isLoading: state.loading,
    error: state.error,
    hasUnsavedChanges: state.hasUnsavedChanges,
    addProduct,
    removeProduct,
    updateQuantity,
    syncOrder: syncOrderMutation.mutate,
    isSyncing: syncOrderMutation.isPending,
    cleanOrder,
    createTemporaryOrder
  }
}
