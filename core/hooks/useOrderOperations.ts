import { useCallback, useState } from 'react'
import { Alert } from 'react-native'
import { Order, OrderDetail } from '@/types/types'
import { orderService } from '@/core/services/order.service'
import { temporaryOrderService } from '@/core/services/temporary_order.service'
import { useOrder } from '../context/OrderContext'
import { Product } from '@/types/productTypes'
import { uuidEntero } from '@/utils/uuidUtils'
import { firstValueFrom } from 'rxjs'
import { router } from 'expo-router'
import { useOrderUpdater } from './useGetSaveOptions'

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
      try {
        const result = await operation()
        return result
      } catch (error) {
        const errorDetail =
          error instanceof Error ? error.message : 'Unknown error'
        Alert.alert('Error', `${errorMessage}: ${errorDetail}`)
        throw error
      }
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

 
  const saveOrder = useCallback(async () => {
    if (!currentOrder) return

    return handleAPIOperation(
      async () => {
        let  options = await getSaveOptions(currentOrder)
        let savedOrder: Order | undefined

        if (isTemporary) {
          // Sincronizamos las órdenes temporales y obtenemos los nuevos IDs
          const syncResult = await firstValueFrom(
            temporaryOrderService.syncTemporaryOrder(options)
          )

          if (syncResult) {
            const newOrderId = syncResult.newOrderId
            // Actualizamos los parámetros de la ruta para reflejar el nuevo orderId
            router.setParams({ orderId: newOrderId.toString() })
            // Recargamos la orden desde el servidor con el nuevo ID
            savedOrder = await orderService.getOrder(newOrderId)
          } else {
            throw new Error('No se pudo encontrar la ordern sincronizada')
          }
        } else {
          await firstValueFrom(orderService.syncOrders(options))
          savedOrder = await orderService.getOrder(orderId)
        }

        if (savedOrder) {
          dispatch({ type: 'SET_ORDER', payload: savedOrder })
          dispatch({
            type: 'SET_ORDER_DETAILS',
            payload: savedOrder.detalles || []
          })
          setHasUnsavedChanges(false) // Cambios sincronizados
        } else {
          throw new Error('No se pudo recuperar la orden después de guardar')
        }

        return savedOrder
      },
      isTemporary
        ? 'Error sincronizando orden temporal'
        : 'Error guardando orden'
    )
  }, [currentOrder, handleAPIOperation, dispatch, orderId, isTemporary])

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

  return {
    removeProduct,
    saveOrder,
    updateQuantity,
    clearCurrentOrder,
    temporaryRemoveOrderDetail,
    addToOrder,
    loadOrder,
    reloadOriginalOrder, // Nueva función para recargar la orden original
    hasUnsavedChanges // Exponemos la bandera de cambios no guardados
  }
}
