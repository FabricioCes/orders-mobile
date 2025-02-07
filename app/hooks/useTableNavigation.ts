import { useEffect } from 'react'
import { Alert } from 'react-native'
import { router } from 'expo-router'
import { useSettings } from '@/context/SettingsContext'
import { useOrderManagement } from '@/hooks/useOrderManagement'
import { ActiveTable } from '@/types/tableTypes'
import { orderService } from '@/core/services/order.service'

export const useTableNavigation = (place: string) => {
  const { hasUser, checkTokenExpiration, settings, userName, token } = useSettings()
  const { activeTables } = useOrderManagement(0,userName, token,  place)

  const loadActiveTables = () => {
    try {
      orderService.loadActiveOrders$();
    } catch {
      throw new Error("Error cargando mesas activas");
    }
  };

  useEffect(() => {
    if (hasUser) {
      loadActiveTables()
    }
  }, [place, hasUser])

  const handleTablePress = (tableId: number) => {
    const isActive: boolean =
      activeTables?.some(
        (order: ActiveTable) =>
          Number(order.numeroMesa) === tableId &&
          order.zona.trim().toUpperCase() === place.trim().toUpperCase()
      ) || false

    const activeOrder = activeTables?.find(
      (order: ActiveTable) =>
        Number(order.numeroMesa) === tableId &&
        order.zona.trim().toUpperCase() === place.trim().toUpperCase()
    )

    const navigationParams = {
      tableId,
      place,
      isActive: isActive.toString(),
      orderId: activeOrder?.identificador || 0,
      totalOrder: activeOrder?.totalConDescuento || 0
    }

    handleNavigation(navigationParams)
  }

  const handleNavigation = (params: {
    tableId: number
    place: string
    isActive: string
    orderId: number
    totalOrder: number
  }) => {
    if (hasUser) {
      checkTokenExpiration()
      router.navigate({ pathname: '/screens/order-screen', params })
    } else if (!settings) {
      showConfigurationAlert()
    } else {
      showLoginAlert()
    }
  }

  const showConfigurationAlert = () =>
    Alert.alert(
      'Oops! 🥺🏼',
      'Debes configurar la IP',
      [{ text: 'Aceptar', onPress: () => router.navigate('/settings') }],
      { cancelable: false }
    )

  const showLoginAlert = () =>
    Alert.alert(
      'Oops! 🥺🏼',
      'Debes Iniciar Sesión 🧑',
      [
        { text: 'Aceptar', onPress: () => router.navigate('/components/login') }
      ],
      { cancelable: false }
    )

  return {
    handleTablePress,
    activeTables,
    loadActiveTables,
    isTableActive: (tableId: number) => {
      return (
        activeTables?.some(
          (order: ActiveTable) =>
            Number(order.numeroMesa) === tableId &&
            order.zona.trim().toUpperCase() === place.trim().toUpperCase()
        ) || false
      )
    }
  }
}
