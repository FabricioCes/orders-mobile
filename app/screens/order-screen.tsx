import { useCallback, useEffect, useRef, useState } from "react"; // Agregar useState
import { View, Text, Alert } from "react-native";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import CustomerSection from "../components/customers/customer-section";
import ProductSection from "../components/products/product-section";
import OrderSummaryItem from "../components/orders/order-summary-item";
import OrderDetailsList from "../components/orders/order-details-list";
import Toast from "react-native-toast-message";
import { useOrderOperations } from "@/core/hooks/useOrderOperations";

export default function OrderScreen() {
  const { tableId = "0", place = "", orderId = "0" } = useLocalSearchParams();
  const orderIdentify = Number(orderId);
  const navigation = useNavigation();

  const {
    order,
    orderDetails,
    isLoading,
    error,
    removeProduct,
    updateQuantity,
    syncOrder,
    isSyncing,
    cleanOrder,
    hasUnsavedChanges,
    createTemporaryOrder,
  } = useOrderOperations(orderIdentify);

  const hasCreatedOrder = useRef(false);
  const [expanded, setExpanded] = useState(false); // Estado para controlar la expansión

  useEffect(() => {
    if (orderIdentify === 0 && !hasCreatedOrder.current) {
      createTemporaryOrder(tableId as string, place as string);
      hasCreatedOrder.current = true;
    }
  }, [orderIdentify, tableId, place, createTemporaryOrder]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (!hasUnsavedChanges) {
        return;
      }
      e.preventDefault();
      Alert.alert(
        "Cambios no guardados",
        "¿Estás seguro de que quieres salir sin guardar los cambios?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Salir sin guardar",
            style: "destructive",
            onPress: () => {
              cleanOrder();
              navigation.dispatch(e.data.action);
            },
          },
        ]
      );
    });
    return unsubscribe;
  }, [navigation, hasUnsavedChanges, cleanOrder]);

  useEffect(() => {
    const formattedPlace =
      (typeof place === "string" ? place : "").charAt(0).toUpperCase() +
      (typeof place === "string" ? place : "").slice(1).toLowerCase();
    navigation.setOptions({ title: `Mesa ${tableId} - ${formattedPlace}` });
  }, [tableId, place, navigation]);

  const handleNavigateToProducts = useCallback(() => {
    const currentOrderId = order?.numeroOrden?.toString() ?? "0";
    router.navigate({
      pathname: "/screens/products-screen",
      params: {
        orderId: currentOrderId,
        isActive: "false",
      },
    });
  }, [order]);

  const handleSaveOrder = useCallback(async () => {
    if (!order) return;
    syncOrder(undefined, {
      onSuccess: () => {
        Toast.show({
          type: "success",
          text1: "Orden guardada",
          text2: "La orden se ha sincronizado correctamente.",
        });
        router.replace({
          pathname: "/(tabs)/tab",
          params: { refresh: Date.now().toString() },
        });
      },
      onError: (error: unknown) => {
        const errorMessage =
          typeof error === "object" && error !== null && "message" in error
            ? (error as Error).message
            : "Error desconocido";
        Toast.show({
          type: "error",
          text1: "Error al guardar la orden",
          text2: errorMessage,
        });
      },
    });
  }, [order, syncOrder]);

  const handleToggleSummary = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  if (error) {
    const errorMessage =
      typeof error === "object" && error !== null && "message" in error
        ? (error as Error).message
        : "Error desconocido";
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">{errorMessage}</Text>
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
            onProductPress={() => {}}
            onDeleteProduct={removeProduct}
            onUpdateQuantity={({ detailId, quantity }) =>
              updateQuantity(detailId, quantity)
            }
          />
        </View>
        <OrderSummaryItem
          total={order?.totalSinDescuento || 0}
          itemsCount={orderDetails.length}
          onSave={handleSaveOrder}
          isActive={false}
          isSaving={isSyncing}
          expanded={expanded} // Usar el estado dinámico
          onToggle={handleToggleSummary} // Pasar la función de toggle
          hasChanges={hasUnsavedChanges} // Usar hasUnsavedChanges del contexto
        />
      </View>
      <Toast />
    </View>
  );
}
