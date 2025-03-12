import { useCallback, useEffect } from "react";
import { View, Text } from "react-native";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import CustomerSection from "../components/customers/customer-section";
import ProductSection from "../components/products/product-section";
import OrderSummaryItem from "../components/orders/order-summary-item";
import OrderDetailsList from "../components/orders/order-details-list";
import Toast from "react-native-toast-message";
import { useSettings } from "@/core/context/SettingsContext";
import { useActiveTables } from "@/core/context/ActiveTablesContext";
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
  } = useOrderOperations(orderIdentify);

  useEffect(() => {
    const formattedPlace =
      (typeof place === "string" ? place : "").charAt(0).toUpperCase() +
      (typeof place === "string" ? place : "").slice(1).toLowerCase();
    navigation.setOptions({ title: `Mesa ${tableId} - ${formattedPlace}` });
  }, [tableId, place, navigation]);

  const handleNavigateToProducts = useCallback(() => {
    router.navigate({
      pathname: "/screens/products-screen",
      params: { order: JSON.stringify(order), isActive: "false" },
    });
  }, [order]);

  const handleSaveOrder = useCallback(async () => {
    if (!order) return;
    syncOrder(undefined, {
      onSuccess: () => {
        router.replace({
          pathname: "/(tabs)/tab",
          params: { refresh: Date.now().toString() },
        });
      },
      onError: (error: unknown) => {
        const errorMessage =
          (error as Error).message ? (error as Error).message : "Error desconocido";
        Toast.show({
          type: "error",
          text1: "Error al guardar la orden",
          text2: errorMessage,
        });
      },
    });
  }, [order, syncOrder]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Cargando...</Text>
      </View>
    );
  }

  if (error) {
    const errorMessage =
      (error as unknown) instanceof Error ? (error as unknown as Error).message : "Error desconocido";
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
            onUpdateQuantity={({ detailId, quantity }) => updateQuantity(detailId, quantity)}
          />
        </View>
        <OrderSummaryItem
          total={order?.totalSinDescuento || 0}
          itemsCount={orderDetails.length}
          onSave={handleSaveOrder}
          isActive={false}
          isSaving={isSyncing}
          expanded={false}
          onToggle={() => {}}
          hasChanges={false}
        />
      </View>
    </View>
  );
}
