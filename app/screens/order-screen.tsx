import { useEffect, useState, useCallback } from "react";
import {
  View,
  Alert,
  BackHandler,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import ClientSection from "../components/client-section";
import ProductSection from "../components/product-section";
import { useOrderManagement } from "@/hooks/useOrderManagement";
import OrderSummaryItem from "../components/orders/order-summary-item";
import ProductDetail from "../components/orders/product-detail";
import type { Order } from "@/types/types";

export default function OrderScreen() {
  const params = useLocalSearchParams();
  const {
    tableId = "0",
    place = "",
    isActive = "false",
    orderId = "0",
  } = params;

  const {
    order,
    orderDetails,
    addToOrder,
    removeFromOrder,
    updateQuantity,
    handleSaveOrder,
    setSearchQuery,
  } = useOrderManagement(
    isActive === "true",
    Number(orderId),
    Number(tableId),
    String(place)
  );

  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    id: number;
    currentQty: number;
  } | null>(null);
  const [inputValue, setInputValue] = useState("");

  const handleQuantityChange = () => {
    if (selectedProduct && inputValue) {
      const quantity = parseInt(inputValue, 10);
      if (!isNaN(quantity)) {
        updateQuantity(selectedProduct.id, quantity);
      }
    }
    setShowQuantityModal(false);
  };
  const handleNavigateToProducts = useCallback(() => {
    router.navigate("/screens/products-screen");
  }, []);

  const handleProductPress = useCallback(
    (productId: number, detailId: number) => {
      Alert.alert(
        "Modificar producto",
        "¿Qué deseas hacer con este producto?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: () => removeFromOrder(detailId),
          },
          {
            text: "Modificar cantidad",
            onPress: () => {
              const product = orderDetails.find(
                (d) => d.idProducto === productId
              );
              if (product) {
                setSelectedProduct({
                  id: productId,
                  currentQty: product.cantidad,
                });
                setInputValue(product.cantidad.toString());
                setShowQuantityModal(true);
              }
            },
          },
        ]
      );
    },
    [removeFromOrder, orderDetails]
  );

  const handleBackAction = useCallback(() => {
    if (unsavedChanges) {
      Alert.alert(
        "Salir sin guardar",
        "Tienes cambios no guardados. ¿Deseas salir y perderlos?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Salir",
            onPress: () => {
              router.back();
              setUnsavedChanges(false);
            },
          },
        ]
      );
      return true;
    }
    return false;
  }, [unsavedChanges]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackAction
    );

    return () => backHandler.remove();
  }, [handleBackAction]);

  useEffect(() => {
    if (orderDetails.length > 0) setUnsavedChanges(true);
  }, [orderDetails]);

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
          <ProductSection onAddProduct={handleNavigateToProducts} />

          <ScrollView className="flex-1">
            <View className="p-4">
              {orderDetails.length > 0 ? (
                orderDetails.map((product) => (
                  <TouchableOpacity
                    key={product.identificadorOrdenDetalle}
                    onPress={() => handleProductPress(product.idProducto, product.identificadorOrdenDetalle)}
                    className="mb-3"
                  >
                    <ProductDetail
                      product={product}
                      quantity={product.cantidad}
                      /* onQuantityChange={(newQty) =>
                        updateQuantity(product.idProducto, newQty)
                      } */
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
          total={order?.totalSinDescuento || 0}
          itemsCount={orderDetails.length}
          onSave={handleSaveOrder}
          isActive={isActive === "true"}
          isSaving={false} // Puedes manejar un estado de loading si es necesario
        />
      </View>
      {showQuantityModal && (
        <View className="absolute inset-0 bg-black/50 justify-center p-4">
          <View className="bg-white rounded-lg p-6">
            <Text className="text-lg font-bold mb-4">Nueva cantidad</Text>
            <TextInput
              className="border border-gray-300 rounded p-3 mb-4"
              keyboardType="numeric"
              value={inputValue}
              onChangeText={setInputValue}
              autoFocus
            />
            <View className="flex-row justify-end gap-3">
              <TouchableOpacity
                className="px-4 py-2"
                onPress={() => setShowQuantityModal(false)}
              >
                <Text className="text-gray-600">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-4 py-2 bg-blue-500 rounded"
                onPress={handleQuantityChange}
              >
                <Text className="text-white">Actualizar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
