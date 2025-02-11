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
    backgroundColor: "#e0e7ff",
    shadowColor: "#818cf8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  evenBackground: {
    backgroundColor: "#ede9fe",
  },
  nameText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4338ca",
  },
  cedText: {
    fontSize: 14,
    color: "#4f46e5",
    marginTop: 4,
  },
});

export default React.memo(CustomerListItem);