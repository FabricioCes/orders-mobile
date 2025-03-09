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
  const productName =
    "nombre" in product ? product.nombre : product.nombreProducto;

  useEffect(() => {
    if (visible) {
      const initialQty =
        "cantidad" in product ? product.cantidad.toString() : "1";
      setQuantity(initialQty);
    }
  }, [visible, product]); // Añadido product como dependencia

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
    const numericQuantity = parseInt(quantity) || 1;
    onConfirm(Math.max(numericQuantity, 1));
  };

  return (
    <CustomModal visible={visible} onClose={onCancel}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>
          Seleccionar cantidad para {productName}
        </Text>

        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => adjustQuantity("decrement")}
            accessibilityLabel="Reducir cantidad"
          >
            <FontAwesome name="minus" size={16} color="#4b5563" />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={quantity}
            onChangeText={handleQuantityChange}
            selectTextOnFocus
          />

          <TouchableOpacity
            style={styles.button}
            onPress={() => adjustQuantity("increment")}
            accessibilityLabel="Aumentar cantidad"
          >
            <FontAwesome name="plus" size={16} color="#4b5563" />
          </TouchableOpacity>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity
            onPress={handleConfirm}
            style={styles.confirmButton}
            accessibilityLabel="Confirmar cantidad"
          >
            <Text style={styles.confirmText}>Confirmar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </CustomModal>
  );
};

// Estilos optimizados usando variables de color
const COLORS = {
  primary: "#3b82f6",
  background: "#f3f4f6",
  border: "#e5e7eb",
  text: "#1f2937",
  danger: "#ef4444",
};

const styles = StyleSheet.create({
  contentContainer: {
    padding: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 24,
    textAlign: "center",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
  },
  button: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 10,
    minWidth: 48,
    alignItems: "center",
  },
  input: {
    backgroundColor: COLORS.background,
    width: 80,
    padding: 12,
    fontSize: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
    textAlign: "center",
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    width: "100%",
  },
  cancelButton: {
    padding: 12,
  },
  cancelText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "500",
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  confirmText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default QuantityModal;
