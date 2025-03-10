import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { Customer } from "@/types/customerTypes";
import { memo } from "react";

type Props = {
  customer: Customer;
  onPress: (customer: Customer) => void;
};

const CustomerListItem: React.FC<Props> = ({ customer, onPress }) => (
  <TouchableOpacity
    style={[
      styles.itemContainer,
      customer.identificacion % 2 === 0 && styles.evenBackground,
    ]}
    onPress={() => onPress(customer)}
    accessibilityRole="button"
  >
    <Text style={styles.nameText}>
      {customer.nombre}
    </Text>
    <Text style={styles.cedText}>{customer.cedula}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  itemContainer: {
    width: "100%",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  evenBackground: {
    backgroundColor: "#f3f4f6",
  },
  nameText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    flexWrap: "wrap", // Permite que el texto se extienda a múltiples líneas
  },
  cedText: {
    fontSize: 14,
    color: "#4B5563",
    marginTop: 4,
  },
});

export default memo(CustomerListItem);

