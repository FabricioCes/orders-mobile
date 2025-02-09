// QuantityModal.tsx
import React, { useState, useEffect } from "react";
import {
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Product } from "@/types/productTypes";
import { OrderDetail } from "@/types/types";

interface QuantityModalProps {
  visible: boolean;
  product: Product | OrderDetail;
  onCancel: () => void;
  onConfirm: (quantity: number) => void;
}

const QuantityModal: React.FC<QuantityModalProps> = ({
  visible,
  product,
  onCancel,
  onConfirm,
}) => {
  const [quantity, setQuantity] = useState("1");

  // Reinicia la cantidad a "1" cada vez que se abre el modal
  useEffect(() => {
    if (visible) {
      setQuantity("1");
    }
  }, [visible]);

  const handleDecrement = () => {
    setQuantity(Math.max(Number(quantity) - 1, 1).toString());
  };

  const handleIncrement = () => {
    setQuantity((Number(quantity) + 1).toString());
  };

  const handleConfirm = () => {
    const qty = parseInt(quantity) || 1;
    onConfirm(qty);
  };

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
            Seleccionar cantidad para {"nombre" in product ? product.nombre : product.nombreProducto}
          </Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity style={styles.button} onPress={handleDecrement}>
              <FontAwesome name="minus" size={16} color="#4b5563" />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
            />
            <TouchableOpacity style={styles.button} onPress={handleIncrement}>
              <FontAwesome name="plus" size={16} color="#4b5563" />
            </TouchableOpacity>
          </View>
          <View style={styles.actionContainer}>
            <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
              <Text style={styles.confirmText}>Agregar</Text>
            </TouchableOpacity>
          </View>
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
    maxWidth: 320,
    padding: 24,
    borderRadius: 10,
    // Sombra para iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Elevación para Android
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#e5e7eb",
    padding: 12,
    borderRadius: 4,
  },
  input: {
    backgroundColor: "#f3f4f6",
    width: 80,
    textAlign: "center",
    paddingVertical: 12,
    marginHorizontal: 8,
    fontSize: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  cancelText: {
    color: "#6b7280",
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  confirmText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default QuantityModal;
