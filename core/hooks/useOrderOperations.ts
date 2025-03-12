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

  // Cargar la orden desde el servidor
  const { data: order, isSuccess } = useQuery<Order, Error>({
    queryKey: ['order', orderId],
    queryFn: () => orderService.getOrder(orderId),
    enabled: !!orderId // Solo se ejecuta si orderId es válido
  })

  useEffect(() => {
    if (isSuccess && order) {
      dispatch({ type: 'SET_ORDER', payload: order })
    }
  }, [order, isSuccess, dispatch])

  // Cargar los detalles de la orden desde el servidor
  const { data: orderDetails, isSuccess: detailsSuccess } = useQuery<OrderDetail[], Error>({
    queryKey: ['orderDetails', orderId],
    queryFn: () => orderService.getOrderDetails(orderId),
    enabled: !!orderId
  })

  useEffect(() => {
    if (detailsSuccess && orderDetails) {
      dispatch({ type: 'SET_ORDER_DETAILS', payload: orderDetails })
    }
  }, [orderDetails, detailsSuccess, dispatch])

  // Mutación para sincronizar la orden con el servidor
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
      // Limpiar la orden y sus detalles
      dispatch({ type: 'RESET_ORDER' })
      // Limpiar el cliente seleccionado
      clearSelectedCustomer()
    },
    onError: error => {
      dispatch({ type: 'SET_ERROR', payload: error.message })
    }
  })

  // Funciones para operaciones locales
  const addProduct = (product: OrderDetail) => {
    dispatch({ type: 'ADD_ORDER_DETAIL', payload: product })
  }

  const removeProduct = (detailId: number) => {
    dispatch({ type: 'REMOVE_ORDER_DETAIL', payload: detailId })
  }

  const updateQuantity = (detailId: number, quantity: number) => {
    const detail = state.orderDetails.find(d => d.idOrdenDetalle === detailId)
    if (detail) {
      dispatch({
        type: 'UPDATE_ORDER_DETAIL',
        payload: { detailId, updatedDetail: { ...detail, cantidad: quantity } }
      })
    }
  }

  return {
    order: state.order,
    orderDetails: state.orderDetails,
    isLoading: state.loading,
    error: state.error,
    hasUnsavedChanges: state.hasUnsavedChanges,
    addProduct,
    removeProduct,
    updateQuantity,
    syncOrder: syncOrderMutation.mutate,
    isSyncing: syncOrderMutation.isPending
  }
}
