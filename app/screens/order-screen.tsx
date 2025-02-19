// OrderScreen.tsx
import { useState, useCallback, useEffect, useRef } from "react";
import { View, Alert, Text } from "react-native";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import CustomerSection from "../components/customers/customer-section";
import ProductSection from "../components/products/product-section";
import OrderSummaryItem from "../components/orders/order-summary-item";
import { OrderDetail } from "@/types/types";
import ProductOptionsModal from "../components/products/product-option-modal";
import QuantityModal from "../components/products/quantity-modal";
import OrderDetailsList from "../components/orders/order-details-list";
import { orderService } from "@/core/services/order.service";
import { useOrder } from "@/core/context/OrderContext";
import { useOrderState } from "@/core/hooks/useOrderState";
import { useOrderManagement } from "../../core/hooks/useOrderManagement";
import { useCustomer } from "../../core/context/CustomerContext";

export default function OrderScreen() {
  const {
    tableId = "0",
    place = "",
    isActive = "false",
    orderId = "0",
    userName = "",
    token = "",
    isTemp = false,
  } = useLocalSearchParams();

  const { createNewOrder, clearCurrentOrder, temporaryRemoveOrderDetail } =
    useOrderManagement(
      Number(orderId),
      String(userName),
      String(token),
      isActive === "true",
      String(tableId),
      String(place),
      Boolean(isTemp)
    );
  const navigation = useNavigation();

  const { state, dispatch, fetchOrder } = useOrder();
  const { order, orderDetails } = state;
  const { order: orderFromService, details } = useOrderState(
    Number(orderId),
    String(userName),
    String(token),
    String(place),
    Boolean(isTemp)
  );

  const { clearCustomer } = useCustomer();

  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] =
    useState<OrderDetail | null>(null);

  // Estado para controlar la visibilidad del resumen
  const [showSummary, setShowSummary] = useState(true);

  const dirtyRef = useRef(false);

  useEffect(() => {
    if (orderFromService)
      dispatch({ type: "SET_ORDER", payload: orderFromService });
    if (details?.length)
      dispatch({ type: "SET_ORDER_DETAILS", payload: details });
  }, [orderFromService, details, dispatch]);

  function hasOrderBeenModified() {
    return dirtyRef.current;
  }
  const resetOrderState = () => {
    dispatch({ type: "RESET_ORDER" });
    clearCurrentOrder();
    clearCustomer();
  };

  useEffect(() => {
    if (
      Number(orderId) > 0 &&
      order &&
      !order.esTemporal &&
      !hasOrderBeenModified()
    ) {
      console.log("Fetch");
      fetchOrder(String(orderId));
      dirtyRef.current = true;
    } else if (Number(orderId) === 0 && !order) {
      resetOrderState();
      createNewOrder();
      dirtyRef.current = true;
    }
  }, [orderId, tableId, order]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      e.preventDefault();
      Alert.alert("Salir", "¿Desea salir de la orden?", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Salir",
          onPress: () => {
            resetOrderState();
            navigation.dispatch(e.data.action);
          },
        },
      ]);
    });
    return unsubscribe;
  }, [navigation]);

  const handleNavigateToProducts = useCallback(() => {
    router.navigate({
      pathname: "/screens/products-screen",
      params: { orderId: order?.numeroOrden?.toString() ?? "0", isActive },
    });
  }, [order, isActive]);

  const handleProductPress = useCallback((product: OrderDetail) => {
    setSelectedOrderDetail(product);
    setShowOptionsModal(true);
  }, []);

  const handleSaveOrder = useCallback(() => {
    if (order) {
      orderService
        .saveOrder({ ...order, detalles: orderDetails })
        .then(() => Alert.alert("Éxito", "Orden guardada correctamente"))
        .catch(() => Alert.alert("Error", "Error al guardar la orden"));
    }
  }, [order, orderDetails]);

  return (
    <View className="flex-1 bg-gray-50">
      <View className="p-4 bg-white shadow-sm">
        <View className="flex-row justify-center">
          <Text className="text-xl font-semibold">
            Mesa {tableId} - {place}
          </Text>
        </View>
      </View>

      <View className="flex-1">
        <CustomerSection
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

        {/* Resumen de la Orden con toggle en el encabezado */}
        <OrderSummaryItem
          subtotal={0}
          total={order?.totalSinDescuento || 0}
          tax={order?.totalIVA || 0}
          service={order?.totalServicio || 0}
          taxIncluded={true}
          serviceIncluded={true}
          itemsCount={orderDetails.length}
          onSave={handleSaveOrder}
          isActive={isActive === "true"}
          isSaving={false}
          expanded={showSummary}
          onToggle={() => setShowSummary(!showSummary)}
        />
      </View>

      {showOptionsModal && selectedOrderDetail && (
        <ProductOptionsModal
          visible={showOptionsModal}
          product={selectedOrderDetail}
          onCancel={() => setShowOptionsModal(false)}
          onDelete={() => {
            temporaryRemoveOrderDetail(
              selectedOrderDetail.identificadorOrdenDetalle
            );
            setShowOptionsModal(false);
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
          onCancel={() => setShowQuantityModal(false)}
          onConfirm={(newQuantity) => {
            dispatch({
              type: "UPDATE_ORDER_DETAIL",
              payload: { ...selectedOrderDetail, cantidad: newQuantity },
            });
            setShowQuantityModal(false);
          }}
        />
      )}
    </View>
  );
}
