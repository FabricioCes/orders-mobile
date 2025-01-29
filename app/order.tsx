import React from "react";
import { View, Text, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import ClientSection from "./client-section";
import ProductSection from "./product-section";
import { useOrderManagement } from "@/hooks/useOrderManagement";
import OrderSummaryItem from "./orders/order-summary-item";

export default function Order() {
  const { tableId, place, isActive, orderId, totalOrder } =
    useLocalSearchParams();
  const {
    selectedProducts,
    order,
    handleSaveOrder
  } = useOrderManagement(
    isActive === "true",
    Number(orderId),
    Number(totalOrder),
    Number(tableId),
    String(place)
  );

  return (
    <View className="flex-1 bg-gray-50">
      <View className="p-4 bg-white shadow-sm">
        <Text className="text-xl font-semibold text-center">
          Mesa {tableId} - {place}
        </Text>
      </View>

      <ScrollView className="p-4">
        <ClientSection />
        <ProductSection
          products={selectedProducts}
          onAddProduct={() => router.navigate({ pathname: "/products-screen" })}
        />
      </ScrollView>
        <OrderSummaryItem
        isActive={isActive === "true"}
        order={order}
        handleSaveOrder={handleSaveOrder}
      />
    </View>
  );
}
