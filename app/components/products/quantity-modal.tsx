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

interface QuantityModalProps {
  visible: boolean;
  product: OrderDetail | null;
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
  const isProductSelected = !!product;

  useEffect(() => {
    if (visible && isProductSelected) {
      setQuantity(product.cantidad.toString());
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
      onConfirm(numericQuantity);
    }
  };

  return (
    <CustomModal visible={visible} onClose={onCancel}>
      <View style={styles.modalContent}>
        <Text style={styles.title}>
          {isProductSelected
            ? `Cantidad para ${product.nombreProducto}`
            : "Producto no seleccionado"}
        </Text>

        {isProductSelected && (
          <>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.decrementButton}
                onPress={() => adjustQuantity("decrement")}
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
              >
                <FontAwesome name="plus" size={20} color={COLORS.buttonText} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleConfirm}
              style={styles.confirmButton}
            >
              <Text style={styles.confirmButtonText}>Confirmar</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </CustomModal>
  );
};

const COLORS = {
  primary: "#3B82F6",
  background: "#fff",
  border: "#9CA3AF",
  text: "#1F2937",
  buttonText: "#fff",
  decrement: "#EF4444",
  increment: "#10B981",
};

const styles = StyleSheet.create({
  modalContent: {
    width: "100%",
    padding: 32,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
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
  },
  incrementButton: {
    backgroundColor: COLORS.increment,
    padding: 14,
    borderRadius: 12,
    minWidth: 60,
    alignItems: "center",
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
