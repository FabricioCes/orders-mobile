// OrderScreen.tsx
import { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Alert,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import ClientSection from "../components/client-section";
import ProductSection from "../components/product-section";
import OrderSummaryItem from "../components/orders/order-summary-item";
import ProductDetail from "../components/products/product-detail";
import { OrderDetail } from "@/types/types";
import { useOrderManagement } from "@/hooks/useOrderManagement";
import ProductOptionsModal from "../components/products/product-option-modal";
import QuantityModal from "../components/products/quantity-modal";



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

  // Estados para el manejo de modales
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] =
    useState<OrderDetail | null>(null);

  // Actualiza la cantidad del producto (se utiliza el identificador de producto)
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

  // Al presionar sobre un producto se almacena el detalle seleccionado y se muestra el modal de opciones
  const handleProductPress = useCallback((product: OrderDetail) => {
    setSelectedOrderDetail(product);
    setShowOptionsModal(true);
  }, []);

  const hasOrderBeenModified = () => {
    if (!initialOrderRef.current || !order) return false;

    if (initialOrderRef.current.idCliente !== order.idCliente) return true;

    if (initialDetailsRef.current.length !== orderDetails.length) return true;

    for (let currentDetail of orderDetails) {
      const initialDetail = initialDetailsRef.current.find(
        (d) =>
          d.identificadorOrdenDetalle === currentDetail.identificadorOrdenDetalle
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
            onPress: () => {},
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
                    onPress={() => handleProductPress(product)}
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

      {showOptionsModal && selectedOrderDetail && (
        <ProductOptionsModal
          visible={showOptionsModal}
          product={selectedOrderDetail}
          onCancel={() => {
            setShowOptionsModal(false);
            setSelectedOrderDetail(null);
          }}
          onDelete={() => {
            removeProduct(selectedOrderDetail.identificadorOrdenDetalle);
            setShowOptionsModal(false);
            setSelectedOrderDetail(null);
          }}
          onModify={() => {
            setShowOptionsModal(false);
            setShowQuantityModal(true);
          }}
        />
      )}

      {showQuantityModal && selectedOrderDetail && (
        <QuantityModal
          visible={showQuantityModal}
          product={selectedOrderDetail}
          onCancel={() => {
            setShowQuantityModal(false);
            setSelectedOrderDetail(null);
          }}
          onConfirm={(newQuantity: number) => {
            updateProductQuantity(
              selectedOrderDetail.identificadorProducto,
              newQuantity
            );
            setShowQuantityModal(false);
            setSelectedOrderDetail(null);
          }}
        />
      )}
    </View>
  );
}
