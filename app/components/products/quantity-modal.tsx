import { useState, useEffect } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { OrderDetail } from "@/types/types";
import CustomModal from "../custom-modal";
import { Product } from "@/types/productTypes";

interface QuantityModalProps {
  visible: boolean;
  product: Product | OrderDetail | null; // Permitimos null
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
  const isProductSelected = product !== null && product !== undefined;
  const productName = isProductSelected
    ? "nombre" in product
      ? product.nombre
      : product.nombreProducto
    : "No hay producto seleccionado";

  useEffect(() => {
    if (visible && isProductSelected) {
      const initialQty =
        "cantidad" in product ? product.cantidad.toString() : "1";
      setQuantity(initialQty);
    }
  }, [visible, product]);

  const handleQuantityChange = (text: string) => {
    if (/^\d*$/.test(text)) {
      setQuantity(text || "1");
    }
  };

  const adjustQuantity = (operation: "increment" | "decrement") => {
    setQuantity((prev) => {
      const current = parseInt(prev) || 1;
      return operation === "increment"
        ? `${current + 1}`
        : `${Math.max(current - 1, 1)}`;
    });
  };

  const handleConfirm = () => {
    if (isProductSelected) {
      const numericQuantity = parseInt(quantity) || 1;
      onConfirm(Math.max(numericQuantity, 1));
    }
  };

  return (
    <CustomModal visible={visible} onClose={onCancel}>
      <View style={styles.modalContent}>
        <Text style={styles.title}>
          {isProductSelected ? `Seleccionar cantidad para ${productName}` : productName}
        </Text>

        {isProductSelected && (
          <>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.decrementButton}
                onPress={() => adjustQuantity("decrement")}
                accessibilityLabel="Reducir cantidad"
              >
                <FontAwesome name="minus" size={20} color={COLORS.buttonText} />
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={quantity}
                onChangeText={handleQuantityChange}
                selectTextOnFocus
              />

              <TouchableOpacity
                style={styles.incrementButton}
                onPress={() => adjustQuantity("increment")}
                accessibilityLabel="Aumentar cantidad"
              >
                <FontAwesome name="plus" size={20} color={COLORS.buttonText} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleConfirm}
              style={styles.confirmButton}
              accessibilityLabel="Confirmar cantidad"
            >
              <Text style={styles.confirmButtonText}>Confirmar</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </CustomModal>
  );
};

// Colores vibrantes y consistentes
const COLORS = {
  primary: "#3B82F6", // Azul principal para confirmar
  background: "#fff", // Fondo blanco
  border: "#9CA3AF", // Gris claro para bordes
  text: "#1F2937", // Gris oscuro para texto
  buttonText: "#fff", // Blanco para texto de botones
  secondaryText: "#4B5563", // Gris medio para íconos
  decrement: "#EF4444", // Rojo para decrementar
  increment: "#10B981", // Verde para incrementar
};

const styles = StyleSheet.create({
  modalContent: {
    width: "100%",
    padding: 32,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    elevation: 5,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 20,
    textAlign: "center",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginBottom: 28,
  },
  decrementButton: {
    backgroundColor: COLORS.decrement,
    padding: 14,
    borderRadius: 12,
    minWidth: 60,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  incrementButton: {
    backgroundColor: COLORS.increment,
    padding: 14,
    borderRadius: 12,
    minWidth: 60,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  input: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 12,
    height: 60,
    width: 90,
    paddingHorizontal: 16,
    fontSize: 20,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    textAlign: "center",
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 12,
    elevation: 3,
    width: "100%",
  },
  confirmButtonText: {
    color: COLORS.buttonText,
    fontWeight: "700",
    textAlign: "center",
    fontSize: 20,
  },
});

export default QuantityModal;