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
import { useCustomer } from "../../core/context/CustomerContext";
import { useOrder } from "@/core/context/OrderContext";
import Toast from "react-native-toast-message";
import { temporaryOrderService } from "@/core/services/temporary_order.service";
import { useOrderOperations } from "@/core/hooks/useOrderOperations";

export default function OrderScreen() {
  const {
    tableId = "0",
    place = "",
    isActive = "false",
    orderId = "0"
  } = useLocalSearchParams();
  const orderIdentify = Number(orderId);
  const navigation = useNavigation();

  const {
    state: { order, orderDetails, loading, error },
    dispatch,
  } = useOrder();
  const { clearCustomer } = useCustomer();

  // Hook de operaciones (guardar, eliminar, actualizar, etc.)
  const {
    loadOrder,
    saveOrder,
    removeProduct,
    updateQuantity
  } = useOrderOperations(orderIdentify, order);

  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] =
    useState<OrderDetail | null>(null);
  const [showSummary, setShowSummary] = useState(true);

  const hasInitializedOrder = useRef(false);
  const isTemporary = order?.esTemporal ?? false;

  const subtotal = isTemporary
    ? orderDetails.reduce(
        (sum, detail) => sum + detail.costoUnitario * detail.cantidad,
        0
      )
    : order?.totalSinDescuento || 0;

    useEffect(() => {
      const createTemporalOrder = async () => {
        if (orderIdentify === 0 && !order && !hasInitializedOrder.current) {
          hasInitializedOrder.current = true;
          try {
            dispatch({ type: "SET_LOADING", payload: true });
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
          } catch (error) {
            dispatch({ type: "SET_ERROR", payload: error instanceof Error ? error.message : "Unknown error" });
          } finally {
            dispatch({ type: "SET_LOADING", payload: false });
          }
        }
      };
      createTemporalOrder();
    }, [orderIdentify, order, tableId, place, dispatch]);

  // Si ya existe un orderId válido, se carga la orden desde el API vía el hook
  useEffect(() => {
    if (!order?.esTemporal) {
      loadOrder();
    }
  }, [order?.esTemporal, loadOrder]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      e.preventDefault();
      Alert.alert("Salir", "¿Desea salir de la orden?", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Salir",
          onPress: () => {
            dispatch({ type: "RESET_ORDER" });
            clearCustomer();
            navigation.dispatch(e.data.action);
          },
        },
      ]);
    });
    return unsubscribe;
  }, [navigation, dispatch, clearCustomer]);

  const handleNavigateToProducts = useCallback(() => {
    router.navigate({
      pathname: "/screens/products-screen",
      params: {
        order: JSON.stringify(order),
        isActive,
      },
    });
  }, [order, isActive]);

  const handleProductPress = useCallback((product: OrderDetail) => {
    setSelectedOrderDetail(product);
    setShowOptionsModal(true);
  }, []);

  // Utiliza el hook para guardar la orden
  const handleSaveOrder = useCallback(async () => {
    if (!order) return;

    try {
      dispatch({ type: "SET_LOADING", payload: true });
      await saveOrder();
      Toast.show({
        type: "success",
        text1: "Orden guardada",
        text2: "La orden se ha guardado correctamente.",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          error instanceof Error
            ? error.message
            : "No se pudo guardar la orden.",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [order, dispatch, saveOrder]);

  // En el modal de opciones, al eliminar se usa la función del hook
  const handleDeleteProduct = useCallback(() => {
    if (selectedOrderDetail) {
      removeProduct(selectedOrderDetail.idOrdenDetalle);
      setShowOptionsModal(false);
    }
  }, [selectedOrderDetail, removeProduct]);

  // Para actualizar la cantidad se llama al hook y luego se cierra el modal
  const handleUpdateQuantity = useCallback(
    (newQuantity: number) => {
      if (selectedOrderDetail) {
        updateQuantity(selectedOrderDetail.idProducto, newQuantity);
        setShowQuantityModal(false);
      }
    },
    [selectedOrderDetail, updateQuantity]
  );

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">{error}</Text>
      </View>
    );
  }

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
          orderId={orderIdentify}
        />
        <View className="flex-1 border-t border-gray-200">
          <ProductSection onAddProduct={handleNavigateToProducts} />
          <OrderDetailsList
            orderDetails={orderDetails}
            onProductPress={handleProductPress}
          />
        </View>

        <OrderSummaryItem
          subtotal={subtotal}
          total={subtotal}
          tax={isTemporary ? 0 : order?.totalIVA || 0}
          service={isTemporary ? 0 : order?.totalServicio || 0}
          taxIncluded={!isTemporary}
          serviceIncluded={!isTemporary}
          itemsCount={orderDetails.length}
          onSave={handleSaveOrder}
          isActive={isActive === "true"}
          isSaving={loading}
          expanded={showSummary}
          onToggle={() => setShowSummary(!showSummary)}
        />
      </View>

      {showOptionsModal && selectedOrderDetail && (
        <ProductOptionsModal
          visible={showOptionsModal}
          product={selectedOrderDetail}
          onCancel={() => setShowOptionsModal(false)}
          onDelete={handleDeleteProduct}
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
          onConfirm={handleUpdateQuantity}
        />
      )}
    </View>
  );
}
