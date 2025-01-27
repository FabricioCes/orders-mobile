// eslint-disable no-unused-vars
import { useState, useEffect } from 'react'
import { Order, OrderDetail, Product } from '@/types/types'
import { useOrder } from '@/context/OrderContext'
import { useProducts } from '@/context/ProductsContext'
import { useClients } from '@/context/ClientsContext'
import { useSettings } from '@/context/SettingsContext'
import { Alert } from 'react-native'

export function useOrderManagement (
  isActive: boolean,
  orderId: number,
  totalOrder: number,
  tableId: number,
  place: string
) {
  const [order, setOrder] = useState<Order>({
    numeroOrden: isActive ? orderId : 0,
    numeroLugar: tableId.toString(),
    ubicacion: place.toUpperCase(),
    observaciones: '',
    nombreCliente: '',
    idCliente: 0,
    idUsuario: '',
    autorizado: true,
    totalSinDescuento: totalOrder | 0,
    detalles: []
  })

  const [expandedSubCategory, setExpandedSubCategory] = useState<string | null>(
    null
  )
  const [expandedSubSubCategory, setExpandedSubSubCategory] = useState<
    string | null
  >(null)
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')

  const { saveOrder, getOrderDetails, apiOrderDetails, deleteOrderDetail } =
    useOrder()
  const { selectedClient, clearClient } = useClients()
  const { orderedProducts } = useProducts()

  // Normalizar texto para la búsqueda
  const normalizeText = (text: string) =>
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')

  const filteredMenu = orderedProducts.map(subCategory => ({
    ...subCategory,
    subSubCategories: subCategory.subSubCategories.map(subSubCategory => ({
      ...subSubCategory,
      products: subSubCategory.products.filter(product =>
        normalizeText(product.name).includes(normalizeText(searchQuery))
      )
    }))
  }))

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setExpandedSubCategory(null)
      setExpandedSubSubCategory(null)
    } else {
      for (const subCategory of filteredMenu) {
        for (const subSubCategory of subCategory.subSubCategories) {
          if (subSubCategory.products.length > 0) {
            setExpandedSubCategory(subCategory.name)
            setExpandedSubSubCategory(subSubCategory.name)
            return
          }
        }
      }
    }
  }, [searchQuery])
  // Obtener detalles de la orden si está activa
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (isActive) {
        await getOrderDetails(orderId)
      }
    }
    fetchOrderDetails()
  }, [isActive, orderId])

  useEffect(() => {
    if (isActive && apiOrderDetails.length > 0) {
      setOrderDetails(apiOrderDetails)
    }
  }, [apiOrderDetails, isActive])

  useEffect(() => {
    if (selectedClient) {
      setOrder(prevOrder => ({
        ...prevOrder,
        nombreCliente: selectedClient.name || 'Cliente',
        idCliente: selectedClient.id || 1000
      }))
    }
  }, [selectedClient])

  // Agregar producto a la orden
  const addToOrder = (product: Product) => {
    setOrderDetails(prevDetails => {
      const existingDetail = prevDetails.find(
        detail => detail.idProducto === product.id
      )

      if (existingDetail) {
        return prevDetails.map(detail =>
          detail.idProducto === product.id
            ? { ...detail, qty: detail.cantidad + 1 }
            : detail
        )
      }

      const newDetail: OrderDetail = {
        identificadorOrdenDetalle: 0,
        idProducto: product.id,
        nombreProducto: product.name,
        cantidad: 1,
        precio: product.price,
        porcentajeDescProducto: 0,
        ingrediente: false,
        quitarIngrediente: false
      }

      return [...prevDetails, newDetail]
    })
  }

  // Eliminar producto de la orden
  const removeFromOrder = async (productId: number, detailId: number) => {
    Alert.alert(
      'Confirmación',
      '¿Estás seguro de que deseas eliminar este detalle de la orden?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteOrderDetail(detailId)
            if (success) {
              setOrderDetails(prevDetails =>
                prevDetails.filter(detail => detail.idProducto !== productId)
              ) // Eliminar el detalle de la orden si se eliminó de la base de datos
            } else {
              console.log('Error al eliminar el detalle de la orden')
            }
          }
        }
      ],
      { cancelable: false }
    )
  }

  useEffect(() => {
    if (orderDetails.length === 0) clearClient()
  }, [orderDetails])

  // Actualizar el total de la orden
  useEffect(() => {
    const total = orderDetails.reduce(
      (acc, detail) => acc + detail.cantidad * detail.precio,
      0
    )
    setOrder(prevOrder => ({
      ...prevOrder,
      totalSinDescuento: total
    }))
  }, [orderDetails])

  // Actualizar cantidad de un producto
  const updateQuantity = (productId: number, quantity: number) => {
    setOrderDetails(prevDetails =>
      prevDetails.map(detail =>
        detail.idProducto === productId
          ? { ...detail, cantidad: quantity }
          : detail
      )
    )
  }

  // Guardar la orden
  const handleSaveOrder = () => {
    const invalidItems = orderDetails.filter(detail => detail.cantidad === 0)
    if (invalidItems.length > 0) {
      Alert.alert(
        'Error',
        'No puedes guardar la orden con productos en cantidad 0. Por favor, verifica los productos.'
      )
      return
    }

    const completeOrder = {
      ...order,
      detalles: orderDetails
    }

    if (isActive) {
      saveOrder(completeOrder, 'PUT')
    } else {
      saveOrder(completeOrder, 'POST')
    }
    clearClient()
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
    setExpandedSubSubCategory
  }
}
