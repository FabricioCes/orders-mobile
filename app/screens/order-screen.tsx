import { useEffect, useState } from "react";
import {
  View,
  Alert,
  BackHandler,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ClientSection from "../components/client-section";
import ProductSection from "../components/product-section";
import { useOrderManagement } from "@/hooks/useOrderManagement";
import OrderSummaryItem from "../components/orders/order-summary-item";
import ProductDetail from "../components/orders/product-detail";
import { Order } from "@/types/types";

export default function OrderScreen() {
  const { tableId, place, isActive, orderId, totalOrder } =
    useLocalSearchParams();

  const { order, orderDetails, setOrderDetails, handleSaveOrder } =
    useOrderManagement(
      isActive === "true",
      Number(orderId),
      Number(totalOrder),
      Number(tableId),
      String(place)
    );

  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const saveOrderLocally = async (currentOrder: Order) => {
    try {
      await AsyncStorage.setItem("currentOrder", JSON.stringify(currentOrder));
    } catch (error) {
      console.error("Error guardando la orden localmente:", error);
    }
  };

  const loadOrderLocally = async () => {
    const savedOrder = await AsyncStorage.getItem("currentOrder");
    if (savedOrder) {
      const parsedOrder = JSON.parse(savedOrder);
      if (JSON.stringify(parsedOrder) !== JSON.stringify(orderDetails)) {
        setOrderDetails(parsedOrder);
      }
    }
  };

  // Limpiar datos locales si el usuario cancela
  const clearLocalOrder = async () => {
    await AsyncStorage.removeItem("currentOrder");
  };
  useEffect(() => {
console.log('order', order)
  }, [order]);

  useEffect(() => {
    loadOrderLocally();

    const handleBackAction = () => {
      if (unsavedChanges) {
        Alert.alert(
          "Salir sin guardar",
          "Tienes cambios no guardados. ¿Deseas salir y perderlos?",
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Salir",
              onPress: () => {
                clearLocalOrder();
                router.back();
              },
            },
          ]
        );
        return true; // Bloquear la acción por defecto
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackAction
    );

    return () => backHandler.remove();
  }, [unsavedChanges]);

  useEffect(() => {
    saveOrderLocally(order);
    setUnsavedChanges(true);
  }, [order]);

  return (
    <View className="flex-1 bg-gray-50">
      <View className="p-4 bg-white shadow-sm">
        <Text className="text-xl font-semibold text-center">
          Mesa {tableId} - {place}
        </Text>
      </View>

      <View className="flex-1">
        <ClientSection />
        <View className="flex-1 border-t border-gray-200">
          <ProductSection
            onAddProduct={() => router.navigate("/screens/products-screen")}
          />
          <ScrollView className="flex-1">
            <View className="p-4">
              {order.detalles.length > 0 ? (
                order.detalles.map((product) => (
                  <TouchableOpacity key={product.idProducto} className="mb-3">
                    <ProductDetail
                      product={product}
                      addToOrder={() => setOrderDetails(order.detalles)}
                      showDetails={true}
                    />
                  </TouchableOpacity>
                ))
              ) : (
                <View className="bg-gray-50 p-3 rounded-lg">
                  <Text className="text-gray-500 text-center">
                    No hay productos seleccionados
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
        <OrderSummaryItem
          isActive={isActive === "true"}
          order={order}
          handleSaveOrder={() => {
            handleSaveOrder();
            setUnsavedChanges(false);
            clearLocalOrder();
          }}
        />
      </View>
    </View>
  );
}
