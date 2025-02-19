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
import { useOrder } from "@/context/OrderContext";
import { useOrderState } from "@/hooks/useOrderState";
import { useCustomer } from "../context/CustomerContext";
import { offlineService } from "@/core/services/offlineService";

export default function OrderScreen() {
  const { tableId = "0", place = "", isActive = "false", orderId = "0", userName = "", token = "" } = useLocalSearchParams();
  const navigation = useNavigation();
  
  const { state, dispatch, fetchOrder } = useOrder();
  const { order, orderDetails } = state;
  const { clearCustomer } = useCustomer();
  const { order: orderFromService, details } = useOrderState(Number(orderId), userName, token, place);
  const { removeOfflineOrder } = offlineService;

  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<OrderDetail | null>(null);

  const dirtyRef = useRef(false);

  useEffect(() => {
    if (orderFromService) dispatch({ type: "SET_ORDER", payload: orderFromService });
    if (details?.length) dispatch({ type: "SET_ORDER_DETAILS", payload: details });
  }, [orderFromService, details, dispatch]);

  useEffect(() => {
    if (Number(orderId) > 0 && order?.esTemporal !== true) {
      fetchOrder(orderId);
    } else {
      dispatch({ type: "RESET_ORDER" });
      clearCustomer();
      removeOfflineOrder(Number(orderId));
    }
  }, [orderId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      e.preventDefault();
      Alert.alert("Salir", "¿Desea salir de la orden?", [
        { text: "Cancelar", style: "cancel" },
        { text: "Salir", onPress: () => navigation.dispatch(e.data.action) },
      ]);
    });
    return unsubscribe;
  }, [navigation]);

  const handleNavigateToProducts = useCallback(() => {
    router.navigate({ pathname: "/screens/products-screen", params: { orderId: order?.numeroOrden?.toString() ?? "0", isActive } });
  }, [order, isActive]);

  const handleProductPress = useCallback((product: OrderDetail) => {
    setSelectedOrderDetail(product);
    setShowOptionsModal(true);
  }, []);

  const handleSaveOrder = useCallback(() => {
    if (order) {
      orderService.saveOrder({ ...order, detalles: orderDetails })
        .then(() => Alert.alert("Éxito", "Orden guardada correctamente"))
        .catch(() => Alert.alert("Error", "Error al guardar la orden"));
    }
  }, [order, orderDetails]);

  return (
    <View className="flex-1 bg-gray-50">
      <View className="p-4 bg-white shadow-sm">
        <Text className="text-xl font-semibold text-center">Mesa {tableId} - {place}</Text>
      </View>

      <View className="flex-1">
        <CustomerSection customerId={Number(order?.idCliente ?? 0)} orderId={Number(orderId)} />
        <View className="flex-1 border-t border-gray-200">
          <ProductSection onAddProduct={handleNavigateToProducts} />
          <OrderDetailsList orderDetails={orderDetails} onProductPress={handleProductPress} />
        </View>
        <OrderSummaryItem total={order?.totalSinDescuento || 0} itemsCount={orderDetails.length} onSave={handleSaveOrder} isActive={isActive === "true"} isSaving={false} />
      </View>

      {showOptionsModal && selectedOrderDetail && (
        <ProductOptionsModal
          visible={showOptionsModal}
          product={selectedOrderDetail}
          onCancel={() => setShowOptionsModal(false)}
          onDelete={() => {
            dispatch({ type: "REMOVE_ORDER_DETAIL", payload: selectedOrderDetail.identificadorOrdenDetalle });
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
            dispatch({ type: "UPDATE_ORDER_DETAIL", payload: { ...selectedOrderDetail, cantidad: newQuantity } });
            setShowQuantityModal(false);
          }}
        />
      )}
    </View>
  );
}
