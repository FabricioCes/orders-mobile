import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { OrderDetail } from "@/types/types";

interface AdditionalModalProps {
  visible: boolean;
  actionType: "add" | "remove" | null;
  product: OrderDetail | null;
  onClose: () => void;
  onSelectAdditional: (additional: any) => void;
}

export default function AdditionalModal({
  visible,
  actionType,
  product,
  onClose,
  onSelectAdditional,
}: AdditionalModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {actionType === "add" ? "Agregar adicional" : "Quitar adicional"}
          </Text>

          <ScrollView 
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
          >
            {product?.adicionales?.map((additional) => (
              <TouchableOpacity
                key={additional.idAdicional}
                style={styles.optionContainer}
                onPress={() => onSelectAdditional(additional)}
              >
                <Text style={styles.optionText}>{additional.nombre}</Text>
                <Text style={styles.optionPrice}>
                  +${additional.precio.toFixed(2)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 20,
    textAlign: "center",
  },
  optionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
  },
  optionText: {
    fontSize: 16,
    color: "#374151",
    flex: 2,
  },
  optionPrice: {
    fontSize: 16,
    color: "#10b981",
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  closeButton: {
    backgroundColor: "#2563eb",
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    marginBottom: 20,
  },
  closeButtonText: {
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
});