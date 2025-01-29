import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import ProductItem from "./orders/product-item";
import { Link } from "expo-router";

interface ProductSectionProps {
  products: Array<{
    id: number;
    name: string;
    price: number;
    description?: string;
  }>;
  onAddProduct?: () => void;
}

const ProductSection: React.FC<ProductSectionProps> = ({
  products,
  onAddProduct,
}) => {
  return (
    <View className="bg-white rounded-lg p-4 mb-6 shadow-sm">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold">Productos</Text>
        <TouchableOpacity
          className="flex-row items-center gap-2"
          onPress={onAddProduct}
        >
          <FontAwesome name="plus" size={16} color="#3b82f6" />
          <Text className="text-blue-500 font-medium">Agregar</Text>
        </TouchableOpacity>
      </View>

      {products.length > 0 ? (
        products.map((product) => (
          <TouchableOpacity className="mb-3">
            <ProductItem
              product={product}
              addToOrder={() => {}}
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
  );
};

export default ProductSection;
