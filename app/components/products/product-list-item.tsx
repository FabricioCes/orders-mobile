// ProductListItem.tsx
import React, { useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Product } from "@/types/productTypes";

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
        style={{
          padding: 12,
          backgroundColor: "#fff",
          borderRadius: 8,
          marginBottom: 8,
        }}
        onPress={() => setShowModal(true)}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "500" }}>{product.nombre}</Text>
            <Text style={{ color: "#6b7280" }}>
              ₡{product.precio.toFixed(2)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View style={{ backgroundColor: "#fff", width: 320, padding: 24, borderRadius: 8 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 16 }}>
              Seleccionar cantidad para {product.nombre}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
              <TouchableOpacity
                style={{ backgroundColor: "#e5e7eb", padding: 12, borderTopLeftRadius: 4, borderBottomLeftRadius: 4 }}
                onPress={() =>
                  setQuantity(Math.max(Number(quantity) - 1, 1).toString())
                }
              >
                <FontAwesome name="minus" size={16} color="#4b5563" />
              </TouchableOpacity>
              <TextInput
                style={{ backgroundColor: "#f3f4f6", width: 80, textAlign: "center", padding: 12, fontSize: 16 }}
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
              />
              <TouchableOpacity
                style={{ backgroundColor: "#e5e7eb", padding: 12, borderTopRightRadius: 4, borderBottomRightRadius: 4 }}
                onPress={() => setQuantity((Number(quantity) + 1).toString())}
              >
                <FontAwesome name="plus" size={16} color="#4b5563" />
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8 }}>
              <TouchableOpacity onPress={() => setShowModal(false)} style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
                <Text style={{ color: "#6b7280" }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAdd} style={{ backgroundColor: "#3b82f6", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}>
                <Text style={{ color: "#fff" }}>Agregar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ProductListItem;
