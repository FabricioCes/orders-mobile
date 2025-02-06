import React from "react";
import { View, Text } from "react-native";
import type { OrderDetail } from "@/types/types";

type ProductDetailProps = {
  product: OrderDetail;
  showDetails?: boolean;
  quantity: number;
  addToOrder: () => void;
  onQuantityChange: (newQty: number) => void;
};

const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  quantity,
  showDetails,
  onQuantityChange,
  addToOrder,
}) => (
  <View className="p-3 bg-gray-50 rounded-lg mb-2">
    <View className="flex-row justify-between items-center">
      <View className="flex-1 mr-4">
        <Text className="text-base font-medium text-gray-800">
          {product.nombreProducto}
        </Text>
        <Text className="text-gray-500 mt-1">
          ₡{product.precio.toFixed(2)}
        </Text>
      </View>
      <View>
      <Text className="text-base font-medium text-gray-700 min-w-[24px] text-center">
        {quantity}
      </Text>
      </View>
    </View>
  </View>
);

export default ProductDetail;
      // Controles de cantidad
      // <View className="flex-row items-center gap-3">
      //   <TouchableOpacity
      //     onPress={() => onQuantityChange(Math.max(quantity - 1, 1))}
      //     disabled={quantity === 1}
      //     className={`p-2 rounded-full ${
      //       quantity === 1 ? "bg-gray-200" : "bg-blue-100"
      //     }`}
      //   >
      //     <FontAwesome
      //       name="minus"
      //       size={16}
      //       color={quantity === 1 ? "#9CA3AF" : "#3B82F6"}
      //     />
      //   </TouchableOpacity>

      //   <Text className="text-base font-medium text-gray-700 min-w-[24px] text-center">
      //     {quantity}
      //   </Text>

      //   <TouchableOpacity
      //     onPress={() => onQuantityChange(quantity + 1)}
      //     className="p-2 bg-blue-100 rounded-full"
      //   >
      //     <FontAwesome name="plus" size={16} color="#3B82F6" />
      //   </TouchableOpacity>
      // </View>