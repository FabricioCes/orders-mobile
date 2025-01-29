import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { OrderDetail } from "@/types/types";
import ProductDetail from "./orders/product-detail";

interface ProductSectionProps {
  products: OrderDetail[];
  onAddProduct?: () => void;
}

const ProductSection: React.FC<ProductSectionProps> = ({
  products,
  onAddProduct,
}) => {
    console.log(products)
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
          <TouchableOpacity key={product.idProducto} className="mb-3">
            <ProductDetail
              key={product.idProducto}
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
