import { useCallback, useState } from 'react'
import { Alert } from 'react-native'
import { ApiResponse, Order, OrderDetail } from '@/types/types'
import { orderService } from '@/core/services/order.service'
import { temporaryOrderService } from '@/core/services/temporary_order.service'
import { useOrder } from '../context/OrderContext'
import { Product } from '@/types/productTypes'
import { uuidEntero } from '@/utils/uuidUtils'
import { firstValueFrom } from 'rxjs'
import { router } from 'expo-router'
import { useOrderUpdater } from './useGetSaveOptions'
import Toast from 'react-native-toast-message'

export const useOrderOperations = (
  orderId: number,
  currentOrder: Order | null = null
) => {
  const { dispatch } = useOrder()
  const [_, setIsInitialLoad] = useState(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false) // Bandera para cambios no sincronizados
  const isTemporary = currentOrder?.esTemporal ?? orderId <= 0
  const { getSaveOptions } = useOrderUpdater()

  const handleAPIOperation = useCallback(
    async <T>(operation: () => Promise<T>, errorMessage: string) => {
        const result = await operation()

        if (
          result &&
          typeof result === 'object' &&
          'codigoRespuesta' in result
        ) {
          const apiResponse = result as unknown as ApiResponse<any>

          if (apiResponse.error) {
            throw new Error(apiResponse.mensaje || errorMessage)
          }
        }

        return result
    },
    []
  )

  const loadOrder = useCallback(async () => {
    if (isTemporary) {
      const tempOrder = temporaryOrderService.getTemporaryOrder(orderId)
      if (tempOrder) {
        dispatch({ type: 'SET_ORDER', payload: tempOrder })
        dispatch({
          type: 'SET_ORDER_DETAILS',
          payload: tempOrder.detalles || []
        })
      }
    } else {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        const order = await orderService.getOrder(orderId)
        const details = await orderService.getOrderDetails(orderId)
        dispatch({ type: 'SET_ORDER', payload: order })
        dispatch({ type: 'SET_ORDER_DETAILS', payload: details })
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: error instanceof Error ? error.message : 'Unknown error'
        })
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
        setIsInitialLoad(false)
        setHasUnsavedChanges(false) // Reseteamos al cargar la orden original
      }
    }
  }, [orderId, dispatch, isTemporary])

  const reloadOriginalOrder = useCallback(async () => {
    if (isTemporary) {
      // Para órdenes temporales, reiniciamos el estado ya que no hay "original" en el servidor
      const tempOrder = temporaryOrderService.getTemporaryOrder(orderId)
      if (tempOrder) {
        dispatch({ type: 'SET_ORDER', payload: tempOrder })
        dispatch({
          type: 'SET_ORDER_DETAILS',
          payload: tempOrder.detalles || []
        })
      } else {
        dispatch({ type: 'RESET_ORDER' })
      }
    } else {
      // Para órdenes persistentes, recargamos desde el servidor
      await loadOrder()
    }
    setHasUnsavedChanges(false)
  }, [orderId, dispatch, isTemporary, loadOrder])

  const addToOrder = useCallback(
    async (product: Product, quantity: number = 1) => {
      const newDetail: OrderDetail = {
        cantidad: quantity,
        nombreProducto: product.nombre,
        costoUnitario: product.costo,
        idOrden: orderId,
        idOrdenDetalle: uuidEntero(),
        idProducto: product.identificador,
        impuestoProducto: product.impuesto ?? 0
      }

      if (isTemporary) {
        const tempOrder = temporaryOrderService.getTemporaryOrder(orderId)
        if (!tempOrder) {
          throw new Error('No se encontró la orden temporal')
        }
        const updatedOrder = temporaryOrderService.addOrderDetail(
          orderId,
          newDetail
        )
        if (updatedOrder) {
          dispatch({ type: 'SET_ORDER', payload: updatedOrder })
          dispatch({
            type: 'SET_ORDER_DETAILS',
            payload: updatedOrder.detalles || []
          })
          setHasUnsavedChanges(true) // Marcamos cambios no guardados
        }
        return updatedOrder?.detalles
      } else {
        const updatedDetails = await orderService.addProduct(orderId, newDetail)
        dispatch({ type: 'SET_ORDER_DETAILS', payload: updatedDetails })
        setHasUnsavedChanges(true) // Marcamos cambios no guardados
        return updatedDetails
      }
    },
    [orderId, dispatch, isTemporary]
  )

  const removeProduct = useCallback(
    (detailId: number) => {
      Alert.alert('Eliminar Producto', '¿Estás seguro?', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            if (isTemporary) {
              const updatedOrder = temporaryOrderService.removeOrderDetail(
                orderId,
                detailId
              )
              if (updatedOrder) {
                dispatch({ type: 'SET_ORDER', payload: updatedOrder })
                dispatch({
                  type: 'SET_ORDER_DETAILS',
                  payload: updatedOrder.detalles || []
                })
                setHasUnsavedChanges(true)
              }
            } else {
              await orderService.removeProduct(orderId, detailId)
              const updatedDetails = await orderService.getOrderDetails(orderId)
              dispatch({ type: 'SET_ORDER_DETAILS', payload: updatedDetails })
              setHasUnsavedChanges(true)
            }
          }
        }
      ])
    },
    [orderId, dispatch, isTemporary]
  )

  const updateQuantity = useCallback(
    async (productId: number, quantity: number) => {
      if (isTemporary) {
        const tempOrder = temporaryOrderService.getTemporaryOrder(orderId)
        if (!tempOrder || !tempOrder.detalles) return
        const detail = tempOrder.detalles.find(d => d.idProducto === productId)
        if (detail) {
          const updatedOrder = temporaryOrderService.updateOrderDetail(
            orderId,
            detail.idOrdenDetalle,
            { cantidad: quantity }
          )
          if (updatedOrder) {
            dispatch({ type: 'SET_ORDER', payload: updatedOrder })
            dispatch({
              type: 'SET_ORDER_DETAILS',
              payload: updatedOrder.detalles || []
            })
            setHasUnsavedChanges(true)
          }
        }
      } else {
        await orderService.updateProductQuantity(orderId, productId, quantity)
        const updatedDetails = await orderService.getOrderDetails(orderId)
        dispatch({ type: 'SET_ORDER_DETAILS', payload: updatedDetails })
        const updatedOrder = await orderService.getOrder(orderId)
        dispatch({ type: 'SET_ORDER', payload: updatedOrder })
        setHasUnsavedChanges(true)
      }
    },
    [orderId, dispatch, isTemporary]
  )

  const updateOrderState = async (orderId: number): Promise<Order> => {
    const savedOrder = await orderService.getOrder(orderId)
    if (!savedOrder) {
      throw new Error('No se pudo recuperar la orden después de guardar')
    }
    dispatch({ type: 'SET_ORDER', payload: savedOrder })
    dispatch({
      type: 'SET_ORDER_DETAILS',
      payload: savedOrder.detalles || []
    })
    setHasUnsavedChanges(false)
    return savedOrder
  }

  const createOrUpdateOrder = async (): Promise<Order> => {
    const options = await getSaveOptions(currentOrder as Order)
    let orderIdToUse: number

    if (isTemporary) {
      // Sincronizamos las órdenes temporales y obtenemos el nuevo ID.
      const syncResult = await firstValueFrom(
        temporaryOrderService.syncTemporaryOrder(options)
      )
      if (!syncResult) {
        throw new Error('No se pudo encontrar la orden sincronizada')
      }
      orderIdToUse = syncResult.newOrderId
      // Actualizamos la ruta con el nuevo orderId.
      router.setParams({ orderId: orderIdToUse.toString() })
    } else {
      await firstValueFrom(orderService.syncOrders(options))
      orderIdToUse = orderId
    }

    return updateOrderState(orderIdToUse)
  }

  const saveOrder = useCallback(async () => {
    if (!currentOrder) return

    return handleAPIOperation(
      async () => createOrUpdateOrder(),
      isTemporary
        ? 'Error sincronizando orden temporal'
        : 'Error guardando orden'
    )
  }, [currentOrder, handleAPIOperation, orderId, isTemporary])

  const clearCurrentOrder = useCallback(() => {
    if (isTemporary) {
      temporaryOrderService.removeTemporaryOrder(orderId)
    }
    dispatch({ type: 'RESET_ORDER' })
    setHasUnsavedChanges(false)
  }, [dispatch, orderId, isTemporary])

  const temporaryRemoveOrderDetail = useCallback(
    async (detailId: number) => {
      if (isTemporary) {
        const updatedOrder = temporaryOrderService.removeOrderDetail(
          orderId,
          detailId
        )
        if (updatedOrder) {
          dispatch({ type: 'SET_ORDER', payload: updatedOrder })
          dispatch({
            type: 'SET_ORDER_DETAILS',
            payload: updatedOrder.detalles || []
          })
          setHasUnsavedChanges(true)
        }
      } else {
        const updatedDetails = await orderService.temporaryRemoveOrderDetail(
          orderId,
          detailId
        )
        dispatch({ type: 'SET_ORDER_DETAILS', payload: updatedDetails })
        setHasUnsavedChanges(true)
      }
    },
    [dispatch, orderId, isTemporary]
  )
  const addClientToOrder = useCallback(
    async (clientId: number) => {
      // Verificamos si existe una orden actual
      if (!currentOrder) {
        Alert.alert('Error', 'No hay una orden actual para actualizar')
        return
      }

      // Creamos una copia de la orden actual con el nuevo ID del cliente
      const updatedOrder = { ...currentOrder, idCliente: clientId }

      if (isTemporary) {
        // Si la orden es temporal
        try {
          const tempOrder = temporaryOrderService.updateTemporaryOrder(
            orderId,
            updatedOrder
          )
          if (tempOrder) {
            // Actualizamos el estado en el contexto con la orden temporal modificada
            dispatch({ type: 'SET_ORDER', payload: tempOrder })
            setHasUnsavedChanges(true) // Marcamos que hay cambios sin guardar
          }
        } catch {
          Alert.alert('Error', 'No se pudo actualizar la orden temporal')
        }
      } else {
        // Si la orden es persistente
        try {
          await orderService.updateOrder(orderId, updatedOrder)
          // Actualizamos el estado en el contexto con la orden persistente modificada
          dispatch({ type: 'SET_ORDER', payload: updatedOrder })
          setHasUnsavedChanges(true) // Marcamos que hay cambios sin guardar
        } catch (error) {
          Alert.alert('Error', 'No se pudo actualizar la orden en el servidor')
        }
      }
    },
    [currentOrder, orderId, isTemporary, dispatch]
  )
  return {
    removeProduct,
    saveOrder,
    updateQuantity,
    clearCurrentOrder,
    temporaryRemoveOrderDetail,
    addToOrder,
    loadOrder,
    addClientToOrder,
    reloadOriginalOrder,
    hasUnsavedChanges
  }
}
