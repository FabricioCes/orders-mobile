// hooks/useTableNavigation.ts
import { useEffect } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useSettings } from '@/context/SettingsContext';
import { useTable } from '@/context/TablesContext';


export const useTableNavigation = (place: string) => {
  const { hasUser, checkTokenExpiration, settings } = useSettings();
  const { activeTables, getActiveTables } = useTable();

  useEffect(() => {
    getActiveTables();
  }, []);

  const handleTablePress = (tableId: number) => {
    const isActive = activeTables.some(
      (table) => table.numeroMesa === tableId && table.zona === place.toUpperCase()
    );

    const activeTable = activeTables.find(
      (table) => table.numeroMesa === tableId && table.zona === place.toUpperCase()
    );

    const navigationParams = {
      tableId,
      place,
      isActive: isActive.toString(),
      orderId: activeTable?.identificador || 0,
      totalOrder: activeTable?.totalConDescuento || 0,
    };

    handleNavigation(navigationParams);
  };

  const handleNavigation = (params: { tableId: number; place: string; isActive: string; orderId: number; totalOrder: number }) => {
    if (hasUser) {
      checkTokenExpiration();
      router.navigate({ pathname: '/Order', params });
    } else if (!settings) {
      showConfigurationAlert();
    } else {
      showLoginAlert();
    }
  };

  const showConfigurationAlert = () =>
    Alert.alert(
      "Oops! 🥺🏼",
      "Debes configurar la IP",
      [{ text: "Aceptar", onPress: () => router.navigate("/settings") }],
      { cancelable: false }
    );

  const showLoginAlert = () =>
    Alert.alert(
      "Oops! 🥺🏼",
      "Debes Iniciar Sesión 🧑",
      [{ text: "Aceptar", onPress: () => router.navigate("/login") }],
      { cancelable: false }
    );

  return { handleTablePress, isTableActive: (tableId: number) => 
    activeTables.some(table => table.numeroMesa === tableId) };
};