import { useState, useEffect, useMemo } from 'react'
import { Order, OrderDetail } from '@/types/types'
import { useOrder } from '@/context/OrderContext'
import { useClients } from '@/context/ClientsContext'
import { Alert } from 'react-native'
import { useSettings } from '@/context/SettingsContext'
import { useProducts } from '@/context/ProductsContext'
import { Product } from '@/types/productTypes'

export function useOrderManagement (
  isActive: boolean,
  orderId: number,
  totalOrder: number,
  tableId: number,
  place: string
) {
  const { userName } = useSettings()
  const { saveOrder, getOrderDetails, apiOrderDetails, deleteOrderDetail } =
    useOrder()
  const { selectedClient, clearClient } = useClients()
  const { groupedProducts, loading, error } = useProducts()

  const [order, setOrder] = useState<Order>({
    numeroOrden: isActive ? orderId : 0,
    numeroLugar: tableId?.toString(),
    ubicacion: place?.toUpperCase(),
    observaciones: '',
    nombreCliente: '',
    idCliente: 0,
    idUsuario: userName.toUpperCase(),
    autorizado: true,
    totalSinDescuento: totalOrder || 0,
    imprimir: true,
    detalles: []
  })

  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [expandedSubCategory, setExpandedSubCategory] = useState<string | null>(
    null
  )
  const [expandedSubSubCategory, setExpandedSubSubCategory] = useState<
    string | null
  >(null)
  const normalizeText = (text: string) =>
    text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  // Filtrar productos basado en la búsqueda
  const filteredMenu = useMemo(
    () =>
      groupedProducts.map(subCategory => ({
        ...subCategory,
        subCategories: subCategory.subCategories.map(subSubCategory => ({
          ...subSubCategory,
          products: subSubCategory.products.filter(product =>
            normalizeText(product.name).includes(normalizeText(searchQuery))
          )
        }))
      })),
    [groupedProducts, searchQuery]
  )

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setExpandedSubCategory(null)
      setExpandedSubSubCategory(null)
    } else {
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
  }, [searchQuery, filteredMenu])

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (isActive) await getOrderDetails(orderId)
    }
    fetchOrderDetails()
  }, [isActive, orderId, getOrderDetails])

  useEffect(() => {
    if (isActive) {
      setOrderDetails(apiOrderDetails)
    }
  }, [isActive])

  useEffect(() => {
    if (selectedClient) {
      setOrder(prevOrder => ({
        ...prevOrder,
        nombreCliente: selectedClient.name || 'Cliente',
        idCliente: selectedClient.id || 1000
      }))
    }
  }, [selectedClient])

  useEffect(() => {
    if (orderDetails.length === 0) clearClient()
  }, [orderDetails, clearClient])

  useEffect(() => {
    if (Array.isArray(orderDetails)) {
      const total = orderDetails.reduce(
        (sum, detail) => sum + (detail.precio || 0),
        0
      )
      setOrder(prevOrder => {
        if (prevOrder.totalSinDescuento !== total || prevOrder.detalles !== orderDetails) {
          return { ...prevOrder, totalSinDescuento: total, detalles: orderDetails };
        }
        return prevOrder;
      })
    } else {
      console.warn('orderDetails no es un arreglo')
    }
  }, [orderDetails])

  const addToOrder = (product: Product, cantidad: number = 1) => {
    setOrderDetails(prevDetails => {
      const existingDetail = prevDetails.find(
        detail => detail.idProducto === product.id
      )
      if (existingDetail) {
        return prevDetails.map(detail =>
          detail.idProducto === product.id
            ? { ...detail, cantidad: detail.cantidad + cantidad }
            : detail
        )
      }
      const newDetail: OrderDetail = {
        idProducto: product.id,
        nombreProducto: product.name,
        cantidad,
        precio: product.price,
        porcentajeDescProducto: 0,
        ingrediente: false,
        quitarIngrediente: false,
        identificadorOrdenDetalle: 0
      }
      return [...prevDetails, newDetail]
    })
  }

  const removeFromOrder = async (productId: number, detailId: number) => {
    Alert.alert(
      'Confirmación',
      '¿Estás seguro de que deseas eliminar este detalle de la orden?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteOrderDetail(detailId)
            if (success) {
              setOrderDetails(prevDetails =>
                prevDetails.filter(detail => detail.idProducto !== productId)
              )
            } else {
              console.log('Error al eliminar el detalle de la orden')
            }
          }
        }
      ]
    )
  }

  const updateQuantity = (productId: number, quantity: number) => {
    setOrderDetails(prevDetails =>
      prevDetails.map(detail =>
        detail.idProducto === productId
          ? { ...detail, cantidad: quantity }
          : detail
      )
    )
  }

  const handleSaveOrder = () => {
    const invalidItems = orderDetails.filter(detail => detail.cantidad === 0)
    if (invalidItems.length > 0) {
      Alert.alert(
        'Error',
        'No puedes guardar la orden con productos en cantidad 0.'
      )
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
  }

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
