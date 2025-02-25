import { temporaryOrderService } from '../services/temporary_order.service'
import { useOrderOperations } from './useOrderOperations'
import { useProducts } from '@/core/context/ProductsContext'
import { Order } from '@/types/types'

export const useOrderManagement = (
  orderId: number,
  userName: string,
  token: string,
  isActive: boolean,
  numeroMesa: string,
  zona: string,
  order?: Order,
) => {

  // Estado de productos (por ejemplo, para saber si están cargando)
  const { loading: productsLoading, error: productsError } = useProducts()

  // Obtiene las operaciones para actualizar la orden.
  // Se asume que 'order' ya fue cargada, por lo que se utiliza la aserción no nula.
  const {
    removeProduct,
    updateOrder,
    saveOrder,
    updateQuantity,
    clearCurrentOrder,
    temporaryRemoveOrderDetail,
    addToOrder
  } = useOrderOperations(orderId, order!)



  // Función para crear una orden temporal, en caso de que no exista una orden actual
  const createNewOrder = async () => {
    if (orderId === 0 && !order) {
      await temporaryOrderService.createTemporaryOrder(numeroMesa, zona)
    }
  }

  return {
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
