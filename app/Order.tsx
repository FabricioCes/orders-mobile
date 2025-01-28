import { View, Text } from "react-native";
import React from "react";
import Menu from "./orders/Menu";
import { router, useLocalSearchParams } from "expo-router";
import { useOrderManagement } from "@/hooks/useOrderManagement";
import { useClients } from "@/context/ClientsContext";
import OrderSummary from "./orders/OrderSummary";

export default function Order() {
  const { selectedClient, clearClient } = useClients();

  const { tableId, place, isActive, orderId, totalOrder } =
    useLocalSearchParams();
  const isActiveBoolean = isActive === "true";
  const {
    order,
    orderDetails,
    removeFromOrder,
    updateQuantity,
    handleSaveOrder,
  } = useOrderManagement(isActiveBoolean, Number(orderId), Number(totalOrder), Number(tableId), Array.isArray(place) ? place[0] : place);


  return (
    <View>
      <Text className="text-xl text-center p-5">{`Mesa ${tableId}, ${place}`}</Text>
      <Menu
        tableId={Number(tableId)}
        place={String(place)}
        isActive={isActiveBoolean}
        orderId={Number(orderId)}
        totalOrder={Number(totalOrder)}
      />
      <OrderSummary
        orderDetails={orderDetails}
        selectedClient={selectedClient}
        removeFromOrder={removeFromOrder}
        updateQuantity={updateQuantity}
        total={order.totalSinDescuento ?? 0}
        handleSaveOrder={handleSaveOrder}
        clearClient={clearClient}
        handleAddClient={() => router.navigate("/clients")}
      />
    </View>
  );
}
