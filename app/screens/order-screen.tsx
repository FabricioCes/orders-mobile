import React, { useState, useCallback, useEffect } from "react";
import { View, Alert, Text } from "react-native";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import CustomerSection from "../components/customers/customer-section";
import ProductSection from "../components/products/product-section";
import OrderSummaryItem from "../components/orders/order-summary-item";
import OrderDetailsList from "../components/orders/order-details-list"; // Asegúrate de que la ruta sea correcta
import { useCustomer } from "../../core/context/CustomerContext";
import { useOrder } from "@/core/context/OrderContext";
import Toast from "react-native-toast-message";
import { temporaryOrderService } from "@/core/services/temporary_order.service";
import { useOrderOperations } from "@/core/hooks/useOrderOperations";
import { useSettings } from "@/core/context/SettingsContext";
import { useActiveTables } from "@/core/context/ActiveTablesContext";

export default function OrderScreen() {
  const {
    tableId = "0",
    place = "",
    isActive = "false",
    orderId = "0",
  } = useLocalSearchParams();
  const orderIdentify = Number(orderId);
  const navigation = useNavigation();

  const {
    state: { order, orderDetails, loading, error, hasUnsavedChanges },
    dispatch,
  } = useOrder();
  const {
    state: customerState,
    clearCustomer,
    dispatch: customerDispatch,
  } = useCustomer();
  const { checkTokenExpiration } = useSettings();
  const {
    loadOrder,
    saveOrder,
    removeProduct,
    updateQuantity,
    reloadOriginalOrder,
  } = useOrderOperations(Number(orderId));

  const { loadActiveTables } = useActiveTables();

  const [hasInitializedOrder, setHasInitializedOrder] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const isTemporary = order?.esTemporal ?? false;
  const subtotal = isTemporary
    ? orderDetails.reduce(
        (sum, detail) => sum + detail.costoUnitario * detail.cantidad,
        0
      )
    : order?.totalSinDescuento || 0;

  useEffect(() => {
    const newHasChanges = hasUnsavedChanges || customerState.hasCustomerChanged;
    if (hasChanges !== newHasChanges) {
      setHasChanges(newHasChanges);
    }
  }, [hasUnsavedChanges, customerState.hasCustomerChanged]);

  useEffect(() => {
    const handleOrder = async () => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });
        const isTokenValid = await checkTokenExpiration();
        if (!isTokenValid) {
          Toast.show({
            type: "error",
            text1: "Sesión expirada",
            text2: "Por favor, inicia sesión nuevamente.",
            onHide: () => router.navigate("/components/login"),
          });
          return;
        }

        if (orderIdentify === 0 && !hasInitializedOrder) {
          const newOrder = await temporaryOrderService.createTemporaryOrder(
            String(tableId),
            String(place)
          );
          router.setParams({
            orderId: newOrder.numeroOrden?.toString(),
            tableId: newOrder.numeroMesa?.toString() ?? "0",
            place: newOrder.ubicacion,
          });
          dispatch({ type: "SET_ORDER", payload: newOrder });
          dispatch({ type: "SET_ORDER_DETAILS", payload: [] });
          setHasInitializedOrder(true);
        } else if (!isTemporary && !order) {
          await loadOrder();
          setHasInitializedOrder(true);
        }
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          payload: error instanceof Error ? error.message : "Error desconocido",
        });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    handleOrder();
  }, [orderIdentify, isTemporary, tableId, place, order, hasInitializedOrder]);

  useEffect(() => {
    const formattedPlace =
      place.toString().charAt(0).toUpperCase() +
      place.toString().slice(1).toLowerCase();
    navigation.setOptions({
      title: `Mesa ${tableId.toString().trim()} - ${formattedPlace}`,
    });
  }, [tableId, place, navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      e.preventDefault();
      if (hasChanges) {
        Alert.alert("Cambios no guardados", "¿Deseas salir y descartarlos?", [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Salir",
            onPress: async () => {
              await reloadOriginalOrder();
              clearCustomer();
              navigation.dispatch(e.data.action);
            },
          },
        ]);
      } else {
        dispatch({ type: "RESET_ORDER" });
        clearCustomer();
        navigation.dispatch(e.data.action);
      }
    });
    return unsubscribe;
  }, [navigation, dispatch, clearCustomer, reloadOriginalOrder, hasChanges]);

  const handleNavigateToProducts = useCallback(() => {
    router.navigate({
      pathname: "/screens/products-screen",
      params: { order: JSON.stringify(order), isActive },
    });
  }, [order, isActive]);

  const handleSaveOrder = useCallback(async () => {
    if (!order) return;
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      await saveOrder();
      customerDispatch({ type: "SET_CUSTOMER_CHANGED", payload: false });
      await loadActiveTables();
      router.replace({
        pathname: "/(tabs)/tab",
        params: { refresh: Date.now() }, // ✅ Forzar recarga
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [order, dispatch, saveOrder]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Cargando...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">{error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-1">
        <CustomerSection
          customerId={Number(order?.idCliente ?? 0)}
          orderId={orderIdentify}
        />
        <View className="flex-1 border-t border-gray-200">
          <ProductSection onAddProduct={handleNavigateToProducts} />
          <OrderDetailsList
            orderDetails={orderDetails}
            onProductPress={() => {}} // Puedes dejarlo vacío si no necesitas acción adicional
            onDeleteProduct={removeProduct}
            onUpdateQuantity={updateQuantity}
          />
        </View>

        <OrderSummaryItem
          total={subtotal}
          itemsCount={orderDetails.length}
          onSave={handleSaveOrder}
          isActive={isActive === "true"}
          isSaving={loading}
          expanded={showSummary}
          onToggle={() => setShowSummary(!showSummary)}
          hasChanges={hasChanges}
        />
      </View>
    </View>
  );
}
