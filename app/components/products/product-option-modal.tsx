// ProductOptionsModal.tsx
import React from "react";
import { Modal, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { OrderDetail } from "@/types/types";

interface ProductOptionsModalProps {
  visible: boolean;
  product: OrderDetail;
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
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>
            {product.nombreProducto || "Producto"}
          </Text>
          <Text style={styles.subtitle}>
            ¿Qué deseas hacer con este producto?
          </Text>
          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.optionButton} onPress={onDelete}>
              <Text style={[styles.optionText, styles.deleteText]}>Eliminar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton} onPress={onModify}>
              <Text style={[styles.optionText, styles.modifyText]}>
                Modificar cantidad
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    width: "90%",
    maxWidth: 300,
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    // Sombra para iOS y elevación para Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 16,
  },
  optionsContainer: {
    width: "100%",
    marginBottom: 16,
  },
  optionButton: {
    paddingVertical: 12,
    width: "100%",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
  },
  deleteText: {
    color: "#d11a2a",
  },
  modifyText: {
    color: "#3b82f6",
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#f3f4f6",
    borderRadius: 6,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#555",
  },
});

export default ProductOptionsModal;
