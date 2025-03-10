import { useState, useCallback, useEffect } from "react";
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
    state: { order, orderDetails, loading, error, hasUnsavedChanges },
    dispatch,
  } = useOrder();
  const { state: customerState, clearCustomer, dispatch: customerDispatch} = useCustomer();
  const { checkTokenExpiration } = useSettings();
  const {
    loadOrder,
    saveOrder,
    removeProduct,
    updateQuantity,
    reloadOriginalOrder,
  } = useOrderOperations(Number(orderId));

  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] =
    useState<OrderDetail | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [hasInitializedOrder, setHasInitializedOrder] = useState(false);

  const isTemporary = order?.esTemporal ?? false;

  const subtotal = isTemporary
    ? orderDetails.reduce(
        (sum, detail) => sum + detail.costoUnitario * detail.cantidad,
        0
      )
    : order?.totalSinDescuento || 0;

  // Combinar cambios en productos y cliente, con depuración
  const [hasChanges, setHasChanges] = useState(false);
  useEffect(() => {
    console.log(
      "Checking changes - hasUnsavedChanges:",
      hasUnsavedChanges,
      "hasCustomerChanged:",
      customerState.hasCustomerChanged
    );
    const newHasChanges = hasUnsavedChanges || customerState.hasCustomerChanged;
    if (hasChanges !== newHasChanges) {
      setHasChanges(newHasChanges);
    }
  }, [hasUnsavedChanges, customerState.hasCustomerChanged, orderDetails]);

  useEffect(() => {
    const handleOrder = async () => {
      const isTokenValid = await checkTokenExpiration();
      if (!isTokenValid) {
        Toast.show({
          type: "error",
          text1: "Sesión expirada",
          text2: "Tu sesión ha expirada. Por favor, inicia sesión nuevamente.",
          position: "top",
          visibilityTime: 4000,
          autoHide: true,
          topOffset: 30,
          onHide: () => {
            router.navigate("/components/login");
          },
        });
        return;
      }
      if (orderIdentify === 0) {
        if (!order && !hasInitializedOrder) {
          setHasInitializedOrder(true);
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
          setHasInitializedOrder(true);
        } catch (error) {
          // Manejo de error
        } finally {
          dispatch({ type: "SET_LOADING", payload: false });
        }
      }
    };

    handleOrder();
  }, [tableId, place, isTemporary, loadOrder, dispatch, order, hasInitializedOrder]);

  useEffect(() => {
    const formattedPlace =
      place.toString().charAt(0).toUpperCase() +
      place.toString().slice(1).toLowerCase();
    navigation.setOptions({
      title: `Mesa ${tableId.toString().trim()} - ${formattedPlace}`,
    });
  }, [tableId, place, navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      e.preventDefault();
      if (hasChanges) {
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
  }, [navigation, dispatch, clearCustomer, reloadOriginalOrder, hasChanges]);

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
      customerDispatch({ type: "SET_CUSTOMER_CHANGED", payload: false });

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
          total={subtotal}
          itemsCount={orderDetails.length}
          onSave={handleSaveOrder}
          isActive={isActive === "true"}
          isSaving={loading}
          expanded={showSummary}
          onToggle={() => setShowSummary(!showSummary)}
          hasChanges={hasChanges}
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