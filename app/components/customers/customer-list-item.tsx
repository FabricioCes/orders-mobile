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
    backgroundColor: "#e0f2f1", // Un tono muy claro de teal
    shadowColor: "#80cbc4",     // Sombra en tono teal suave
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  evenBackground: {
    backgroundColor: "#b2dfdb", // Un tono un poco más oscuro para fondos alternos
  },
  nameText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#00695c", // Un teal oscuro para el texto principal
  },
  cedText: {
    fontSize: 14,
    color: "#00796b", // Otro tono oscuro en la familia teal para el texto secundario
    marginTop: 4,
  },
});

export default React.memo(CustomerListItem);