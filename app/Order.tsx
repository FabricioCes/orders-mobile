import { View, Text } from "react-native";
import React from "react";
import Menu from "./orders/Menu";
import { useLocalSearchParams } from "expo-router";
("./orders/OrderSummary");

export default function Order() {
  const { tableId, place, isActive, orderId, totalOrder } =
    useLocalSearchParams();
  const isActiveBoolean = isActive === "true";

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
    </View>
  );
}
