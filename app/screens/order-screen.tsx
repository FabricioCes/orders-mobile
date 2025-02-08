import { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Alert,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import ClientSection from "../components/client-section";
import ProductSection from "../components/product-section";
import OrderSummaryItem from "../components/orders/order-summary-item";
import ProductDetail from "../components/products/product-detail";
import { OrderDetail } from "@/types/types";
import { useOrderManagement } from "@/hooks/useOrderManagement";

export default function OrderScreen() {
  const params = useLocalSearchParams();
  const {
    tableId = "0",
    place = "",
    isActive = "false",
    orderId = "0",
    userName = "",
    token = "",
  } = params;

  const navigation = useNavigation();

  const { order, orderDetails, removeProduct, saveOrder, updateQuantity } =
    useOrderManagement(Number(orderId), String(userName), String(token), "");
  const initialOrderRef = useRef(order);
  const initialDetailsRef = useRef<OrderDetail[]>(orderDetails);

  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    id: number;
    currentQty: number;
  } | null>(null);
  const [inputValue, setInputValue] = useState("");

  const handleQuantityChange = () => {
    if (selectedProduct && inputValue) {
      const quantity = parseInt(inputValue, 10);
      if (!isNaN(quantity) && quantity > 0) {
        updateProductQuantity(selectedProduct.id, quantity);
      } else {
        Alert.alert("Cantidad inválida", "Ingrese un número válido mayor a 0");
      }
    }
    setShowQuantityModal(false);
  };
  const updateProductQuantity = useCallback(
    (id: number, quantity: number) => {
      if (isNaN(quantity)) return;
      updateQuantity(id, quantity);
    },
    [orderId]
  );

  const handleNavigateToProducts = useCallback(() => {
    router.navigate({ pathname: "/screens/products-screen", params });
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
            onPress: () => removeProduct(detailId),
          },
          {
            text: "Modificar cantidad",
            onPress: () => {
              const product = orderDetails.find((d: OrderDetail) => {
                return d.identificadorProducto === productId;
              });
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
    [removeProduct, orderDetails]
  );
  const hasOrderBeenModified = () => {
    if (!initialOrderRef.current || !order) return false;

    if (initialOrderRef.current.idCliente !== order.idCliente) return true;

    if (initialDetailsRef.current.length !== orderDetails.length) return true;

    for (let currentDetail of orderDetails) {
      const initialDetail = initialDetailsRef.current.find(
        (d) => d.identificadorOrdenDetalle === currentDetail.identificadorOrdenDetalle
      );
      if (!initialDetail || initialDetail.cantidad !== currentDetail.cantidad) {
        return true;
      }
    }
    return false;
  };
  useEffect(() => {
    if (order && !initialOrderRef.current) {
      initialOrderRef.current = order;
    }
    if (orderDetails.length && initialDetailsRef.current.length === 0) {
      initialDetailsRef.current = orderDetails;
    }
  }, [order, orderDetails]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (!hasOrderBeenModified()) {
        return;
      }
      e.preventDefault();

      Alert.alert(
        "Orden modificada",
        "La orden ha sido modificada. ¿Desea salir sin guardar los cambios?",
        [
          {
            text: "Cancelar",
            style: "cancel",
            onPress: () => {
            },
          },
          {
            text: "Salir",
            style: "destructive",
            onPress: () => {
              navigation.dispatch(e.data.action);
            },
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, order, orderDetails]);

  return (
    <View className="flex-1 bg-gray-50">
      <View className="p-4 bg-white shadow-sm">
        <Text className="text-xl font-semibold text-center">
          Mesa {tableId} - {place}
        </Text>
      </View>

      <View className="flex-1">
        <ClientSection
          customerId={Number(order?.idCliente ?? 0)}
          orderId={Number(orderId)}
        />

        <View className="flex-1 border-t border-gray-200">
          <ProductSection onAddProduct={handleNavigateToProducts} />

          <ScrollView className="flex-1">
            <View className="p-4">
              {orderDetails.length > 0 ? (
                orderDetails.map((product: OrderDetail) => (
                  <TouchableOpacity
                    key={product.identificadorOrdenDetalle}
                    onPress={() =>
                      handleProductPress(
                        product.identificadorProducto,
                        product.identificadorOrdenDetalle
                      )
                    }
                    className="mb-3"
                  >
                    <ProductDetail
                      key={product.identificadorOrdenDetalle}
                      product={product}
                      quantity={product.cantidad}
                      addToOrder={() => {}}
                      onQuantityChange={() => {}}
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
          onSave={saveOrder}
          isActive={isActive === "true"}
          isSaving={false}
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
