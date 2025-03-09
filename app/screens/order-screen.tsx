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
import { useSettings } from "@/core/context/SettingsContext";

export default function OrderScreen() {
  const {
    tableId = "0",
    place = "",
    isActive = "false",
    orderId = "0",
  } = useLocalSearchParams();
  const orderIdentify = Number(orderId);
  const navigation = useNavigation();

  const {
    state: { order, orderDetails, loading, error },
    dispatch,
  } = useOrder();
  const { clearCustomer } = useCustomer();
  const { checkTokenExpiration } = useSettings();
  const {
    loadOrder,
    saveOrder,
    removeProduct,
    updateQuantity,
    reloadOriginalOrder,
    hasUnsavedChanges,
  } = useOrderOperations(Number(orderId));


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
    const handleOrder = async () => {
      const isTokenValid = await checkTokenExpiration();
      if (!isTokenValid) {
        Toast.show({
          type: 'error', // Estilo de error (generalmente en rojo)
          text1: 'Sesión expirada', // Título del mensaje
          text2: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', // Subtítulo
          position: 'top', // Aparece en la parte superior
          visibilityTime: 4000, // Dura 4 segundos
          autoHide: true, // Se oculta automáticamente
          topOffset: 30, // Distancia desde la parte superior
          onHide: () => {
            router.navigate("/components/login"); // Redirige al login cuando se oculta
          },
        });
        return;
      }
      if (orderIdentify === 0) {
        if (!order && !hasInitializedOrder.current) {
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
            dispatch({
              type: "SET_ERROR",
              payload: error instanceof Error ? error.message : "Unknown error",
            });
          } finally {
            dispatch({ type: "SET_LOADING", payload: false });
          }
        }
      } else if (!isTemporary && !order) {
        try {
          dispatch({ type: "SET_LOADING", payload: true });
          await loadOrder();
        } catch (error) {
          // Manejo de error
        } finally {
          dispatch({ type: "SET_LOADING", payload: false });
        }
      }
    };

    handleOrder();
  }, [tableId, place, isTemporary, loadOrder, dispatch]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      e.preventDefault();
      if (hasUnsavedChanges) {
        Alert.alert(
          "Cambios no guardados",
          "Tienes cambios sin guardar. ¿Deseas salir y descartarlos?",
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Salir",
              onPress: async () => {
                await reloadOriginalOrder();
                clearCustomer();
                navigation.dispatch(e.data.action);
              },
            },
          ]
        );
      } else {
        dispatch({ type: "RESET_ORDER" });
        clearCustomer();
        navigation.dispatch(e.data.action);
      }
    });
    return unsubscribe;
  }, [
    navigation,
    dispatch,
    clearCustomer,
    hasUnsavedChanges,
    reloadOriginalOrder,
  ]);

  const handleNavigateToProducts = useCallback(() => {
    router.navigate({
      pathname: "/screens/products-screen",
      params: { order: JSON.stringify(order), isActive },
    });
  }, [order, isActive]);

  const handleProductPress = useCallback((product: OrderDetail) => {
    setSelectedOrderDetail(product);
    setShowOptionsModal(true);
  }, []);

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

  const handleDeleteProduct = useCallback(() => {
    if (selectedOrderDetail) {
      removeProduct(selectedOrderDetail.idOrdenDetalle);
      setShowOptionsModal(false);
    }
  }, [selectedOrderDetail, removeProduct]);

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
