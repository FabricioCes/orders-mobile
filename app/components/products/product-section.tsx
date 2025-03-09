import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

interface ProductSectionProps {
  onAddProduct?: () => void;
}

const ProductSection: React.FC<ProductSectionProps> = ({ onAddProduct }) => {
  return (
    <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-xl font-semibold text-gray-800">Productos</Text>
        <TouchableOpacity
          className="flex-row items-center gap-2"
          onPress={onAddProduct}
        >
          <FontAwesome name="plus" size={16} color="#3b82f6" />
          <Text className="text-blue-500 font-medium text-base">Agregar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProductSection;