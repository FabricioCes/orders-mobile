import { useState, useEffect } from 'react'
import { Order, OrderDetail, Product } from '@/types/types'
import { useOrder } from '@/context/OrderContext'
import { useProducts } from '@/context/ProductsContext'
import { useClients } from '@/context/ClientsContext'
import { Alert } from 'react-native'
import { useSettings } from '@/context/SettingsContext'

export function useOrderManagement (
  isActive: boolean,
  orderId: number,
  totalOrder: number,
  tableId: number,
  place: string
) {
  const { userName } = useSettings()

  const [order, setOrder] = useState<Order>({
    numeroOrden: isActive ? orderId : 0,
    numeroLugar: tableId?.toString(),
    ubicacion: place?.toUpperCase(),
    observaciones: '',
    nombreCliente: '',
    idCliente: 0,
    idUsuario: userName.toUpperCase(),
    autorizado: true,
    totalSinDescuento: totalOrder | 0,
    imprimir: true,
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

  const addToOrder = (product: Product, cantidad?: number) => {
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
        idProducto: product.id,
        nombreProducto: product.name,
        cantidad: cantidad || 1,
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
              )
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

  useEffect(() => {
    console.log(orderDetails)
    const total = orderDetails.reduce(
      (acc, detail) => acc + detail.cantidad * detail.precio,
      0
    );
    console.log(total)
    setOrder(prevOrder => ({
      ...prevOrder,
      totalSinDescuento: total,
      detalles: orderDetails
    }));
  }, [orderDetails]);

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

    // Validar items con cantidad 0
    if (invalidItems.length > 0) {
      Alert.alert(
        'Error',
        'No puedes guardar la orden con productos en cantidad 0. Por favor, verifica los productos.'
      )
      return
    }

    // Mostrar diálogo de confirmación
    Alert.alert(
      'Imprimir orden',
      '¿Deseas imprimir la orden?',
      [
        {
          text: 'Cancelar',
          style: 'cancel' // Solo para iOS, pero no afecta en Android
        },
        {
          text: 'No Imprimir',
          onPress: () => {
            const completeOrder = {
              ...order,
              detalles: orderDetails,
              imprimir: false // Actualizar propiedad según la respuesta
            }
            saveOrder(completeOrder, isActive ? 'PUT' : 'POST')
            clearClient()
          }
        },
        {
          text: 'Imprimir',
          onPress: () => {
            const completeOrder = {
              ...order,
              detalles: orderDetails,
              imprimir: true // Actualizar propiedad según la respuesta
            }
            saveOrder(completeOrder, isActive ? 'PUT' : 'POST')
            clearClient()
          }
        }
      ],
      { cancelable: true } // Permite cerrar el diálogo tocando fuera
    )
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
