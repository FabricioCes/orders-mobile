import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Product } from "@/types/types";

type ProductItemProps = {
  product: Product;
  addToOrder: (product: Product) => void;
};

const ProductItem: React.FC<ProductItemProps> = ({ product, addToOrder }) => {
  return (
    <View key={product.id} className="mx-2 flex-row justify-between items-center my-1 mt-4">
      <Text className="flex-1">{product.name}</Text>
      <Text className="mx-4">{`₡${product.price}`}</Text>
      <TouchableOpacity
        className="bg-[#007BFF] p-3 rounded-md"
        onPress={() => addToOrder(product)}
      >
        <Text className="font-bold text-white">Agregar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProductItem;
