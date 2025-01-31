import { useState, useMemo, useCallback, useEffect } from 'react'
import { Order, OrderDetail } from '@/types/types'
import { useOrder } from '@/context/OrderContext'
import { useClients } from '@/context/ClientsContext'
import { Alert } from 'react-native'
import { useSettings } from '@/context/SettingsContext'
import { useProducts } from '@/context/ProductsContext'
import { Product } from '@/types/productTypes'

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true

  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
    return false
  }

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) return false

  for (const key of keysA) {
    if (!keysB.includes(key)) return false
    if (!deepEqual(a[key], b[key])) return false
  }

  return true
}

export function useOrderManagement (
  isActive: boolean,
  orderId: number,
  tableId: number,
  place: string
) {
  const { userName } = useSettings()
  const {
    currentOrder,
    saveOrder,
    getOrderDetails,
    apiOrderDetails,
    deleteOrderDetail,
    updateOrder
  } = useOrder()
  const { selectedClient, clearClient } = useClients()
  const { groupedProducts, loading, error } = useProducts()

  // Estado inicial basado en currentOrder o valores por defecto
  const [order, setOrder] = useState<Order>(() => {
    if (isActive && currentOrder?.numeroOrden === orderId) {
      return currentOrder
    }
    return {
      numeroOrden: isActive ? orderId : 0,
      numeroLugar: tableId?.toString(),
      ubicacion: place?.toUpperCase(),
      observaciones: '',
      nombreCliente: '',
      idCliente: 0,
      idUsuario: userName.toUpperCase(),
      autorizado: true,
      totalSinDescuento: 0,
      imprimir: true,
      detalles: []
    }
  })

  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>(
    isActive && currentOrder?.numeroOrden === orderId
      ? currentOrder.detalles
      : []
  )

  const [searchQuery, setSearchQuery] = useState('')
  const [expandedSubCategory, setExpandedSubCategory] = useState<string | null>(
    null
  )
  const [expandedSubSubCategory, setExpandedSubSubCategory] = useState<
    string | null
  >(null)

  // Memoized calculations
  const totalSinDescuento = useMemo(
    () =>{
      console.log('Orden de detalles:', orderDetails) ;
      return orderDetails.reduce(
        (sum, detail) => sum + (detail.precio || 0) * (detail.cantidad || 1),
        0
      )},
    [orderDetails]
  )

  const normalizedSearch = useCallback(
    (text: string) => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''),
    []
  )

  const filteredMenu = useMemo(() => {
    const query = normalizedSearch(searchQuery)
    return groupedProducts
      .map(subCategory => ({
        ...subCategory,
        subCategories: subCategory.subCategories
          .map(subSubCategory => ({
            ...subSubCategory,
            products: subSubCategory.products.filter(product =>
              normalizedSearch(product.name).includes(query)
            )
          }))
          .filter(subSub => subSub.products.length > 0)
      }))
      .filter(subCat => subCat.subCategories.length > 0)
  }, [groupedProducts, searchQuery, normalizedSearch])

  // Efectos principales
  useEffect(() => {
    const syncOrderData = async () => {
      if (isActive) {
        if (currentOrder?.numeroOrden === orderId) {
          if (!deepEqual(currentOrder, order)) {
            setOrder(currentOrder)
            setOrderDetails(currentOrder.detalles)
          }
        } else {
          await getOrderDetails(orderId)
          if (apiOrderDetails.length > 0) {
            setOrderDetails(apiOrderDetails)
          }
        }
      }
    }

    syncOrderData()
  }, [isActive, orderId, currentOrder, apiOrderDetails])

  useEffect(() => {
    if (searchQuery) {
      const expandFirstMatch = () => {
        for (const subCategory of filteredMenu) {
          for (const subSubCategory of subCategory.subCategories) {
            if (subSubCategory.products.length > 0) {
              setExpandedSubCategory(subCategory.category)
              setExpandedSubSubCategory(subSubCategory.name)
              return
            }
          }
        }
      }
      expandFirstMatch()
    } else {
      setExpandedSubCategory(null)
      setExpandedSubSubCategory(null)
    }
  }, [searchQuery, filteredMenu])

  // Actualización sincronizada del contexto
  useEffect(() => {
    if (
      !deepEqual(order.detalles, orderDetails) ||
      order.totalSinDescuento !== totalSinDescuento
    ) {
      const updatedOrder = {
        ...order,
        detalles: orderDetails,
        totalSinDescuento,
        ...(selectedClient && {
          nombreCliente: selectedClient.name || 'Cliente',
          idCliente: selectedClient.id || 1000
        })
      }

      if (!deepEqual(updatedOrder, order)) {
        updateOrder(updatedOrder)
        setOrder(updatedOrder)
      }
    }
  }, [orderDetails, totalSinDescuento, selectedClient])

  // Handlers
  const addToOrder = useCallback((product: Product, cantidad: number = 1) => {
    setOrderDetails(prev => {
      const existing = prev.find(d => d.idProducto === product.id)
      return existing
        ? prev.map(d =>
            d.idProducto === product.id
              ? { ...d, cantidad: d.cantidad + cantidad }
              : d
          )
        : [...prev, createNewDetail(product)]
    })
  }, [])

  const removeFromOrder = useCallback(
    async (detailId: number) => {
      Alert.alert('Confirmación', '¿Eliminar este detalle de la orden?', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteOrderDetail(detailId)
            if (success) {
              setOrderDetails(prev =>
                prev.filter(d => d.identificadorOrdenDetalle !== detailId)
              )
            }
          }
        }
      ])
    },
    [deleteOrderDetail]
  )

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    setOrderDetails(prev =>
      prev.map(d =>
        d.idProducto === productId
          ? { ...d, cantidad: Math.max(quantity, 0) }
          : d
      )
    )
  }, [])

  const handleSaveOrder = useCallback(() => {
    if (orderDetails.some(d => d.cantidad === 0)) {
      Alert.alert('Error', 'No puedes guardar con cantidades en 0')
      return
    }

    Alert.alert('Imprimir orden', '¿Deseas imprimir la orden?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'No Imprimir',
        onPress: () =>
          saveOrder({ ...order, imprimir: false }, isActive ? 'PUT' : 'POST')
      },
      {
        text: 'Imprimir',
        onPress: () =>
          saveOrder({ ...order, imprimir: true }, isActive ? 'PUT' : 'POST')
      }
    ])
  }, [order, orderDetails, isActive, saveOrder])

  return {
    order,
    orderDetails,
    filteredMenu,
    searchQuery,
    setSearchQuery,
    addToOrder,
    removeFromOrder,
    updateQuantity,
    handleSaveOrder,
    setOrderDetails,
    expandedSubCategory,
    setExpandedSubCategory,
    expandedSubSubCategory,
    setExpandedSubSubCategory,
    loading,
    error
  }
}

// Helper function
function createNewDetail (product: Product): OrderDetail {
  return {
    idProducto: product.id,
    nombreProducto: product.name,
    cantidad: 1,
    precio: product.price,
    porcentajeDescProducto: 0,
    ingrediente: false,
    quitarIngrediente: false,
    identificadorOrdenDetalle: 0
  }
}
