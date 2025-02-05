// src/hooks/useOrderManagement.ts
import { useEffect, useState, useCallback, useMemo } from 'react'
import { Alert } from 'react-native'
import NetInfo from '@react-native-community/netinfo'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Subscription } from 'rxjs'
import { Order, OrderDetail } from '@/types/types'
import { Product, ProductGroup } from '@/types/productTypes'
import { orderService } from '@/services/order.service'
import { signalRService } from '@/services/real-time.service'
import { notificationService } from '@/services/notification.service'
import { offlineService } from '@/services/offlineService'
import { useProducts } from '@/context/ProductsContext' // Este hook provee la lista completa de productos

interface UseOrderManagementReturn {
  // Estados y métodos para la orden
  order: Order | null
  orderDetails: OrderDetail[]
  updateOrder: (updatedOrder: Order) => void
  removeProduct: (detailId: number) => void
  saveOrder: () => void
  undoLastAction: () => void
  loading: boolean
  error: string | null
  // Estados y métodos para los productos y búsqueda
  searchQuery: string
  setSearchQuery: (q: string) => void
  filteredMenu: ProductGroup[]
  addToOrder: (product: Product, quantity?: number) => Promise<void>
  productsLoading: boolean
  productsError: string | null
}

export const useOrderManagement = (
  isActive: boolean,
  orderId: number,
  tableId?: number,
  place?: string
): UseOrderManagementReturn => {
  // Estados para la orden
  const [order, setOrder] = useState<Order | null>(null)
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [undoStack, setUndoStack] = useState<OrderDetail[]>([])

  // Estados para la búsqueda de productos
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Se obtiene la lista completa de productos desde el contexto
  const {
    groupedProducts,
    loading: productsLoading,
    error: productsError
  } = useProducts()

  // Filtrado de productos según la búsqueda
  const filteredMenu = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    if (!normalizedQuery) return groupedProducts

    return groupedProducts.filter((group: ProductGroup) => {
      return group.subCategories.some(sub => {
        const subNameMatch = sub.name.toLowerCase().includes(normalizedQuery)
        const productMatch = sub.products.some(product =>
          product.name.toLowerCase().includes(normalizedQuery)
        )
        return subNameMatch || productMatch
      })
    })
  }, [groupedProducts, searchQuery])

  // Efecto para cargar y suscribirse a la información de la orden
  useEffect(() => {
    if (!orderId) return

    const subscriptions: Subscription[] = []
    setLoading(true)
    setError(null)

    const loadCachedData = async () => {
      try {
        const cachedOrder = await AsyncStorage.getItem(`order_${orderId}`)
        const cachedDetails = await AsyncStorage.getItem(
          `orderDetails_${orderId}`
        )
        if (cachedOrder) setOrder(JSON.parse(cachedOrder))
        if (cachedDetails) setOrderDetails(JSON.parse(cachedDetails))
      } catch (err) {
        console.error('Error loading cached data:', err)
      }
    }

    const fetchOrderData = async () => {
      await loadCachedData()
      // Suscribirse al observable de la orden
      subscriptions.push(
        orderService
          .getOrder$(orderId)
          .subscribe(async (data: Order | null) => {
            setOrder(data)
            await AsyncStorage.setItem(`order_${orderId}`, JSON.stringify(data))
          })
      )
      // Suscribirse al observable de los detalles de la orden
      subscriptions.push(
        orderService
          .getOrderDetails$(orderId)
          .subscribe(async (details: OrderDetail[]) => {
            setOrderDetails(details)
            await AsyncStorage.setItem(
              `orderDetails_${orderId}`,
              JSON.stringify(details)
            )
          })
      )
    }

    fetchOrderData().finally(() => setLoading(false))

    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
      if (state.isConnected) offlineService.syncPendingOrders()
    })

    // Actualización en tiempo real para la orden
    signalRService.onOrderUpdated(async updatedOrder => {
      if (updatedOrder.id === orderId) {
        setOrder(updatedOrder)
        await AsyncStorage.setItem(
          `order_${orderId}`,
          JSON.stringify(updatedOrder)
        )
        notificationService.sendNotification(
          'Orden Actualizada',
          'Otro usuario modificó esta orden.'
        )
      }
    })

    // Si el servicio cuenta con actualizaciones separadas para detalles, se podría usar:
    if (typeof signalRService.onOrderUpdated === 'function') {
      signalRService.onOrderUpdated(async ({ orderId: updatedId, details }) => {
        if (updatedId === orderId) {
          setOrderDetails(details)
          await AsyncStorage.setItem(
            `orderDetails_${orderId}`,
            JSON.stringify(details)
          )
        }
      })
    }

    return () => {
      subscriptions.forEach(sub => sub.unsubscribe())
      unsubscribeNetInfo()
    }
  }, [orderId])

  // Función auxiliar para envolver acciones y manejar errores
  const modifyOrder = async (
    action: () => Promise<void>,
    errorMessage: string
  ) => {
    try {
      await action()
    } catch (err) {
      console.error(err)
      setError(errorMessage)
    }
  }

  const removeProduct = (detailId: number) => {
    Alert.alert('Eliminar Producto', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          setUndoStack([...orderDetails])
          modifyOrder(
            () => orderService.removeProduct(orderId, detailId),
            'Error al eliminar producto'
          )
        }
      }
    ])
  }

  const updateOrder = (updatedOrder: Order) => {
    modifyOrder(
      () => orderService.updateOrder(updatedOrder),
      'Error al actualizar la orden'
    )
  }

  const saveOrder = async () => {
    const netState = await NetInfo.fetch()
    if (!netState.isConnected) {
      await offlineService.saveOfflineOrder(orderId, orderDetails)
      Alert.alert(
        'Sin conexión',
        'La orden se guardará cuando vuelva el internet.'
      )
      return
    }
    if (!order) {
      setError('No existe una orden para guardar.')
      return
    }
    Alert.alert('Guardar Orden', '¿Deseas guardar esta orden?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Guardar',
        onPress: () =>
          modifyOrder(
            () => orderService.saveOrder(order),
            'Error al guardar la orden'
          )
      }
    ])
  }

  const undoLastAction = () => {
    if (undoStack.length > 0) {
      setOrderDetails(undoStack)
      setUndoStack([])
    }
  }

  // Función para agregar un producto a la orden.
  // Se crea un objeto OrderDetail a partir de Product.
  const addToOrder = useCallback(
    async (product: Product, quantity: number = 1) => {
      const orderDetail: OrderDetail = {
        idProducto: product.id,
        cantidad: quantity,
        // Se asigna un identificador único (por ejemplo, usando el timestamp)
        identificadorOrdenDetalle: new Date().getTime(),
        nombreProducto: '',
        precio: 0,
        porcentajeDescProducto: 0,
        ingrediente: false,
        quitarIngrediente: false
      }
      await modifyOrder(
        () => orderService.addProduct(orderId, orderDetail),
        'Error al agregar el producto'
      )
    },
    [orderId]
  )

  return {
    order,
    orderDetails,
    updateOrder,
    removeProduct,
    saveOrder,
    undoLastAction,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    filteredMenu,
    addToOrder,
    productsLoading,
    productsError
  }
}
