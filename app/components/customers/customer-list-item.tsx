import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { Customer } from "@/types/customerTypes";

type Props = {
  customer: Customer;
  onPress: (customer: Customer) => void;
};

const CustomerListItem: React.FC<Props> = ({ customer, onPress }) => (
  <TouchableOpacity
    style={[styles.itemContainer, customer.identificacion % 2 === 0 && styles.evenBackground]}
    onPress={() => onPress(customer)}
    accessibilityRole="button"
  >
    <Text style={styles.nameText} numberOfLines={1} ellipsizeMode="tail">
      {customer.nombre}
    </Text>
    <Text style={styles.cedText}>{customer.cedula}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  itemContainer: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: "#e0f7fa", // Un tono muy claro de teal
    shadowColor: "#00695c",     // Sombra en un teal oscuro
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  evenBackground: {
    backgroundColor: "#b2ebf2", // Un tono más oscuro para fondos alternos
  },
  nameText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#00796b", // Un teal oscuro para el texto principal
  },
  cedText: {
    fontSize: 14,
    color: "#004d40", // Un tono aún más oscuro para el texto secundario
    marginTop: 4,
  },
});

export default React.memo(CustomerListItem);