// OrderScreen.tsx
import { useState, useCallback, useEffect, useRef } from "react";
import { View, Alert, Text } from "react-native";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
import CustomerSection from "../components/customer-section";
import ProductSection from "../components/product-section";
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

  const { state, dispatch, fetchOrder } = useOrder();
  const { order, orderDetails } = state;
  const { clearCustomer } = useCustomer();
  const { order: orderFromService, details } = useOrderState(
    Number(orderId),
    String(userName),
    String(token),
    String(place)
  );

  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] =
    useState<OrderDetail | null>(null);

const { removeOfflineOrder } = offlineService;

  useEffect(() => {
    if (orderFromService) {
      dispatch({ type: "SET_ORDER", payload: orderFromService });
    }
  }, [orderFromService, dispatch]);

  useEffect(() => {
    if (details && details.length > 0) {
      dispatch({ type: "SET_ORDER_DETAILS", payload: details });
    }
  }, [details, dispatch]);

  const initialOrderRef = useRef(order);
  const initialDetailsRef = useRef<OrderDetail[]>(orderDetails);

  const dirtyRef = useRef(false);
  const hasOrderBeenModified = useCallback(() => {
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
  }, [order, orderDetails]);

  useEffect(() => {
    dirtyRef.current = hasOrderBeenModified();
  }, [hasOrderBeenModified]);



  const updateProductQuantity = useCallback(
    (id: number, quantity: number) => {
      if (isNaN(quantity)) return;
      const detail = orderDetails.find((d) => d.identificadorProducto === id);
      if (detail) {
        const updatedDetail = { ...detail, cantidad: quantity };
        dispatch({ type: "UPDATE_ORDER_DETAIL", payload: updatedDetail });
      }
    },
    [orderDetails, dispatch]
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
  }, [order, params, isActive]);

  const handleProductPress = useCallback((product: OrderDetail) => {
    setSelectedOrderDetail(product);
    setShowOptionsModal(true);
  }, []);

  useEffect(() => {
    if (order && !initialOrderRef.current) {
      initialOrderRef.current = order;
    }
    if (orderDetails.length && initialDetailsRef.current.length === 0) {
      initialDetailsRef.current = orderDetails;
    }
  }, [order, orderDetails]);

  useEffect(() => {
    if (Number.parseInt(String(orderId)) > 0 && order?.esTemporal != true) {
      fetchOrder(String(orderId));
    } else {
      dispatch({ type: "RESET_ORDER" });
      clearCustomer();
      removeOfflineOrder(Number.parseInt(String(orderId)))
    }
  }, [orderId]);

  useEffect(() => {
    const cleanupTemporaryOrder = () => {
      if (order?.esTemporal) {
        if (order.numeroOrden !== undefined) {
          orderService.removeTemporaryOrder(order.numeroOrden);
        }

        dispatch({ type: "RESET_ORDER" });
        clearCustomer();

        initialOrderRef.current = null;
        initialDetailsRef.current = [];
      }
    };

    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      e.preventDefault();
      if (hasOrderBeenModified()) {
        Alert.alert(
          "Orden modificada",
          "¿Desea salir sin guardar los cambios?",
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Salir",
              onPress: () => {
                cleanupTemporaryOrder();
                navigation.dispatch(e.data.action);
              },
            },
          ]
        );
      } else {
        Alert.alert("Salir", "¿Desea salir de la orden?", [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Salir",
            onPress: () => {
              cleanupTemporaryOrder();
              navigation.dispatch(e.data.action);
            },
          },
        ]);
      }
    });

    return () => {
      unsubscribe();
      cleanupTemporaryOrder();
    };
  }, [navigation, order, orderDetails, dispatch, hasOrderBeenModified]);

  useFocusEffect(
    useCallback(() => {
      if (
        Number(orderId) > 0 &&
        isActive === "true" &&
        order &&
        !order.esTemporal &&
        !dirtyRef.current
      ) {
        const orderSubscription = orderService
          .getOrder$(Number(orderId))
          .subscribe((fetchedOrder) => {
            if (fetchedOrder && !dirtyRef.current) {
              dispatch({ type: "SET_ORDER", payload: fetchedOrder });
              clearCustomer();
            }
          });
        const detailsSubscription = orderService
          .getOrderDetails$(Number(orderId))
          .subscribe((fetchedDetails) => {
            if (fetchedDetails && !dirtyRef.current) {
              dispatch({ type: "SET_ORDER_DETAILS", payload: fetchedDetails });
            }
          });
        return () => {
          orderSubscription.unsubscribe();
          detailsSubscription.unsubscribe();
        };
      }
    }, [orderId, isActive, dispatch])
  );
  useEffect(() => {
    dispatch({ type: "RESET_ORDER" });
    clearCustomer();
    initialOrderRef.current = null;
    initialDetailsRef.current = [];
  }, [orderId, dispatch]);

  const handleSaveOrder = useCallback(() => {
    if (order) {
      orderService
        .saveOrder({ ...order, detalles: orderDetails })
        .then(() => {
          Alert.alert("Éxito", "Orden guardada correctamente");
        })
        .catch(() => {
          Alert.alert("Error", "Error al guardar la orden");
        });
    }
  }, [order, orderDetails]);

  const handleRemoveProduct = useCallback(
    (detailId: number) => {
      dispatch({ type: "REMOVE_ORDER_DETAIL", payload: detailId });
    },
    [dispatch]
  );

  return (
    <View className="flex-1 bg-gray-50">
      <View className="p-4 bg-white shadow-sm">
        <Text className="text-xl font-semibold text-center">
          Mesa {tableId} - {place}
        </Text>
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

        <OrderSummaryItem
          total={order?.totalSinDescuento || 0}
          itemsCount={orderDetails.length}
          onSave={handleSaveOrder}
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
            handleRemoveProduct(selectedOrderDetail.identificadorOrdenDetalle);
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
