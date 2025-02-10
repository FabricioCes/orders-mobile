// OrderScreen.tsx
import { useState, useCallback, useEffect, useRef } from "react";
import { View, Alert, Text, ScrollView, TouchableOpacity } from "react-native";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
import ClientSection from "../components/client-section";
import ProductSection from "../components/product-section";
import OrderSummaryItem from "../components/orders/order-summary-item";
import ProductDetail from "../components/products/product-detail";
import { OrderDetail } from "@/types/types";
import { useOrderManagement } from "@/hooks/useOrderManagement";
import ProductOptionsModal from "../components/products/product-option-modal";
import QuantityModal from "../components/products/quantity-modal";
import OrderDetailsList from "../components/orders/order-details-list";
import { orderService } from "@/core/services/order.service";

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
    useOrderManagement(
      Number(orderId),
      String(userName),
      String(token),
      isActive == "true",
      String(tableId),
      String(place)
    );
  const initialOrderRef = useRef(order);
  const initialDetailsRef = useRef<OrderDetail[]>(orderDetails);

  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] =
    useState<OrderDetail | null>(null);

  const updateProductQuantity = useCallback(
    (id: number, quantity: number) => {
      if (isNaN(quantity)) return;
      updateQuantity(id, quantity);
    },
    [orderId]
  );

  const handleNavigateToProducts = useCallback(() => {
    router.navigate({
      pathname: "/screens/products-screen",
      params: {
        ...params,
        orderId: order?.numeroOrden?.toString() ?? "0",
        isActive: isActive.toString(),
      },
    });
  }, [order, params]);

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
          d.identificadorOrdenDetalle ===
          currentDetail.identificadorOrdenDetalle
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
    const cleanupTemporaryOrder = () => {
      if (order?.esTemporal && hasOrderBeenModified()) {
        if (order.numeroOrden !== undefined) {
          orderService.removeTemporaryOrder(order.numeroOrden);
        }
      }
    };

    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (!hasOrderBeenModified()) {
        cleanupTemporaryOrder();
        return;
      }

      e.preventDefault();
      Alert.alert("Orden modificada", "¿Desea salir sin guardar los cambios?", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Salir",
          onPress: () => {
            cleanupTemporaryOrder();
            navigation.dispatch(e.data.action);
          },
        },
      ]);
    });

    return () => {
      unsubscribe();
      cleanupTemporaryOrder();
    };
  }, [navigation, order, orderDetails]);

  useFocusEffect(
    useCallback(() => {
      if (Number(orderId) > 0 && isActive) {
        orderService.getOrder$(Number(orderId)).subscribe();
        orderService.getOrderDetails$(Number(orderId)).subscribe();
        console.log(order);
        console.log(orderDetails);
      }
      return () => {};
    }, [orderId, isActive])
  );

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

          <OrderDetailsList
            orderDetails={orderDetails}
            onProductPress={handleProductPress}
          />
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
