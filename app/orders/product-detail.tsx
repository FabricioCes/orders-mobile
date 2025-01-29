import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { OrderDetail } from "@/types/types";
import { FontAwesome } from "@expo/vector-icons";

const ProductDetail = ({
  product,
  addToOrder,
  showDetails = false,
}: {
  product: OrderDetail;
  addToOrder: () => void;
  showDetails?: boolean;
}) => (
  <View className="p-3 bg-gray-50 rounded-lg mb-2">
    <View className="flex-row justify-between items-center">
      <Text className="text-base font-medium">{product.nombreProducto}</Text>
      {!showDetails && (
        <TouchableOpacity onPress={addToOrder}>
          <FontAwesome name="plus-circle" size={20} color="#3b82f6" />
        </TouchableOpacity>
      )}
    </View>
    {showDetails && (
      <Text className="text-gray-600">${product.precio.toFixed(2)}</Text>
    )}
  </View>
);

export default ProductDetail;
