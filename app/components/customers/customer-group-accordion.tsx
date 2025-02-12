import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Customer } from "@/types/customerTypes";
import { FontAwesome } from "@expo/vector-icons";
import { useCustomer } from "@/app/context/CustomerContext";

interface CustomerGroupAccordionProps {
  letter: string;
  onSelect: (customer: Customer) => void;
}

const CustomerGroupAccordion: React.FC<CustomerGroupAccordionProps> =
  React.memo(({ letter, onSelect }) => {
    const [expanded, setExpanded] = useState<boolean>(false);
    const [localCustomers, setLocalCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const { loadCustomersForLetter } = useCustomer();

    console.log(letter)
    useEffect(() => {
      if (expanded && localCustomers.length === 0) {
        setLoading(true);
        const subscription = loadCustomersForLetter(letter).subscribe({
          next: (customers: Customer[]) => setLocalCustomers(customers),
          error: (err: any) => {
            console.error(err);
            setLoading(false);
          },
          complete: () => setLoading(false),
        });
        return () => subscription.unsubscribe();
      }

    }, [expanded, localCustomers.length, letter, loadCustomersForLetter]);

    return (
      <View style={styles.groupContainer}>
        <TouchableOpacity
          onPress={() => setExpanded(!expanded)}
          style={styles.header}
        >
          <Text style={styles.letterText}>{letter}</Text>
          <FontAwesome
            name={expanded ? "chevron-up" : "chevron-down"}
            size={16}
            color="#3b82f6"
          />
        </TouchableOpacity>
        {expanded && (
          <View style={styles.customersContainer}>
            {loading ? (
              <ActivityIndicator size="small" color="#3b82f6" />
            ) : (
              localCustomers.map((customer) => (
                <TouchableOpacity
                  key={customer.identificacion}
                  onPress={() => onSelect(customer)}
                  style={styles.customerItem}
                >
                  <Text style={styles.customerText}>{customer.nombre}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </View>
    );
  });

const styles = StyleSheet.create({
  groupContainer: {
    marginBottom: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
  },
  header: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  letterText: {
    fontSize: 18,
    fontWeight: "600",
  },
  customersContainer: {
    paddingLeft: 16,
    paddingBottom: 8,
  },
  customerItem: {
    paddingVertical: 8,
  },
  customerText: {
    fontSize: 16,
    color: "#333",
  },
});

export default CustomerGroupAccordion;
