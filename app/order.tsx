import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import ClientSection from "./client-section";
import ProductSection from "./product-section";
import { useOrderManagement } from "@/hooks/useOrderManagement";
import OrderSummaryItem from "./orders/order-summary-item";
import ProductDetail from "./orders/product-detail";

export default function Order() {
  const { tableId, place, isActive, orderId, totalOrder } =
    useLocalSearchParams();
  const { order, setOrderDetails, handleSaveOrder } = useOrderManagement(
    isActive === "true",
    Number(orderId),
    Number(totalOrder),
    Number(tableId),
    String(place)
  );
  console.log("Order->", order);

  return (
    <View className="flex-1 bg-gray-50">
      <View className="p-4 bg-white shadow-sm">
        <Text className="text-xl font-semibold text-center">
          Mesa {tableId} - {place}
        </Text>
      </View>

      <View className="flex-1">
            <ClientSection />
        <View className="flex-1 border-t border-gray-200">
          <ProductSection
            onAddProduct={() =>
              router.navigate({ pathname: "/products-screen" })
            }
            />
          <ScrollView className="flex-1">
            <View className="p-4">
              {order.detalles.length > 0 ? (
                order.detalles.map((product) => (
                  <TouchableOpacity key={product.idProducto} className="mb-3">
                    <ProductDetail
                      product={product}
                      addToOrder={() => setOrderDetails(order.detalles)}
                      showDetails={true}
                    />
                  </TouchableOpacity>
                ))
              ) : (
                <View className="bg-gray-50 p-3 rounded-lg">
                  <Text className="text-gray-500 text-center">
                    No hay productos seleccionados
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
        <OrderSummaryItem
          isActive={isActive === "true"}
          order={order}
          handleSaveOrder={handleSaveOrder}
        />
      </View>
    </View>
  );
}
