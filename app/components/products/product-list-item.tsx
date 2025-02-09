import React, { useState } from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { Product } from "@/types/productTypes";
import QuantityModal from "./quantity-modal";

const ProductListItem: React.FC<{
  product: Product;
  onAddProduct: (product: Product, quantity: number) => void;
}> = ({ product, onAddProduct }) => {
  const [showModal, setShowModal] = useState(false);

  const handleConfirm = (quantity: number) => {
    onAddProduct(product, quantity);
    setShowModal(false);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={() => setShowModal(true)}
      >
        <View style={styles.content}>
          <View style={styles.infoContainer}>
            <Text style={styles.title}>{product.nombre}</Text>
            <Text style={styles.price}>₡{product.precio.toFixed(2)}</Text>
          </View>
        </View>
      </TouchableOpacity>

      <QuantityModal
        visible={showModal}
        product={product}
        onCancel={() => setShowModal(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%", // Hace que el componente ocupe el ancho completo del contenedor padre
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 8,
    // Opcional: agregar sombra para imitar el estilo de tarjetas o categorías
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  price: {
    color: "#6b7280",
  },
});

export default ProductListItem;
