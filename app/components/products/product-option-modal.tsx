import React from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { OrderDetail } from "@/types/types";
import CustomModal from "../custom-modal";

interface ProductOptionsModalProps {
  visible: boolean;
  product: OrderDetail | null; // Permitimos null
  onCancel: () => void;
  onDelete: () => void;
  onModify: () => void;
}

const ProductOptionsModal: React.FC<ProductOptionsModalProps> = ({
  visible,
  product,
  onCancel,
  onDelete,
  onModify,
}) => {
  const isProductSelected = product !== null && product !== undefined;

  return (
    <CustomModal visible={visible} onClose={onCancel}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>
          {isProductSelected ? product.nombreProducto || "Producto" : "No hay producto seleccionado"}
        </Text>
        <Text style={styles.subtitle}>
          {isProductSelected
            ? "¿Qué deseas hacer con este producto?"
            : "Por favor, selecciona un producto primero."}
        </Text>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.deleteButton,
              !isProductSelected && styles.disabledButton,
            ]}
            onPress={onDelete}
            disabled={!isProductSelected}
          >
            <Text style={styles.deleteText}>Eliminar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.modifyButton,
              !isProductSelected && styles.disabledButton,
            ]}
            onPress={onModify}
            disabled={!isProductSelected}
          >
            <Text style={styles.modifyText}>Modificar cantidad</Text>
          </TouchableOpacity>
        </View>
      </View>
    </CustomModal>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    padding: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 20,
    textAlign: "center",
  },
  optionsContainer: {
    width: "100%",
    marginBottom: 16,
    gap: 12,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButton: {
    backgroundColor: "#fee2e2",
  },
  modifyButton: {
    backgroundColor: "#dbeafe",
  },
  disabledButton: {
    backgroundColor: "#e5e7eb",
    opacity: 0.6,
  },
  deleteText: {
    color: "#dc2626",
    fontSize: 16,
    fontWeight: "500",
  },
  modifyText: {
    color: "#2563eb",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default ProductOptionsModal;