import { useEffect } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useSettings } from '@/core/context/SettingsContext';
import { ActiveTable } from '@/types/tableTypes';
import { useActiveTables } from '../context/ActiveTablesContext';

export const useTableNavigation = (place: string) => {
  const { isLogin, settings } = useSettings();
  const { state, loadActiveTables } = useActiveTables();
  const activeTables = state.activeTables;

  useEffect(() => {
    if (isLogin) {
      loadActiveTables();
    }
  }, [isLogin, loadActiveTables]);

  const handleTablePress = (tableId: number) => {
    const isActive: boolean =
      activeTables?.some(
        (order: ActiveTable) =>
          Number(order.numeroMesa) === tableId &&
          order.zona.trim().toUpperCase() === place.trim().toUpperCase()
      ) || false;

    const activeOrder = activeTables?.find(
      (order: ActiveTable) =>
        Number(order.numeroMesa) === tableId &&
        order.zona.trim().toUpperCase() === place.trim().toUpperCase()
    );
    const navigationParams = {
      tableId,
      place,
      isActive: isActive.toString(),
      orderId: activeOrder?.identificador || 0,
      totalOrder: activeOrder?.totalConDescuento || 0,
    };

    handleNavigation(navigationParams);
  };

  const handleNavigation = (params: {
    tableId: number;
    place: string;
    isActive: string;
    orderId: number;
    totalOrder: number;
  }) => {
    if (isLogin) {
      router.navigate({ pathname: '/screens/order-screen', params });
    } else if (!settings) {
      showConfigurationAlert();
    } else {
      showLoginAlert();
    }
  };

  const showConfigurationAlert = () =>
    Alert.alert(
      'Oops! 🥺🏼',
      'Debes configurar la IP',
      [{ text: 'Aceptar', onPress: () => router.navigate('/screens/settings-screen') }],
      { cancelable: false }
    );

  const showLoginAlert = () =>
    Alert.alert(
      'Oops! 🥺🏼',
      'Debes Iniciar Sesión 🧑',
      [
        { text: 'Aceptar', onPress: () => router.navigate('/components/login') },
      ],
      { cancelable: false }
    );

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
      );
    },
  };
};