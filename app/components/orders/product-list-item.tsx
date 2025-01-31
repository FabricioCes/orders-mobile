import { Product } from "@/types/productTypes";
import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";

const ProductListItem: React.FC<{
  product: Product;
  onAddProduct: (product: Product, quantity: number) => void;
}> = ({ product, onAddProduct }) => {
  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState("1");

  const handleAdd = () => {
    const qty = parseInt(quantity) || 1;
    onAddProduct(product, qty);
    setShowModal(false);
    setQuantity("1");
  };

  return (
    <>
      <TouchableOpacity
        className="p-3 bg-white rounded-lg mb-2"
        onPress={() => setShowModal(true)}
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-base font-medium">{product.name}</Text>
            <Text className="text-gray-600">₡{product.price.toFixed(2)}</Text>
          </View>

        </View>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white w-80 p-6 rounded-lg">
            <Text className="text-lg font-bold mb-4">
              Seleccionar cantidad para {product.name}
            </Text>

            <View className="flex-row items-center justify-center mb-6">
              <TouchableOpacity
                className="bg-gray-200 p-3 rounded-l-lg"
                onPress={() =>
                  setQuantity(Math.max(Number(quantity) - 1, 1).toString())
                }
              >
                <FontAwesome name="minus" size={16} color="#4b5563" />
              </TouchableOpacity>

              <TextInput
                className="bg-gray-100 w-20 text-center p-3 text-lg"
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
              />

              <TouchableOpacity
                className="bg-gray-200 p-3 rounded-r-lg"
                onPress={() => setQuantity((Number(quantity) + 1).toString())}
              >
                <FontAwesome name="plus" size={16} color="#4b5563" />
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-end gap-3">
              <TouchableOpacity
                className="px-4 py-2"
                onPress={() => setShowModal(false)}
              >
                <Text className="text-gray-600">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-blue-500 px-4 py-2 rounded-lg"
                onPress={handleAdd}
              >
                <Text className="text-white">Agregar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ProductListItem;
