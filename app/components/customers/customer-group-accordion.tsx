import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from "react-native";
import { Customer } from "@/types/customerTypes";
import { FontAwesome } from "@expo/vector-icons";
import CustomerListItem from "./customer-list-item";
import { CustomerService } from "@/core/services/customer.service"; // Use service directly

interface CustomerGroupAccordionProps {
  letter: string;
  onSelect: (customer: Customer) => void;
}

const CustomerGroupAccordion: React.FC<CustomerGroupAccordionProps> =
  React.memo(({ letter, onSelect }) => {
    const [expanded, setExpanded] = useState<boolean>(false);
    const [localCustomers, setLocalCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const animation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (expanded) {
        setLoading(true);
        const subscription = CustomerService.loadCustomersForLetter(
          letter
        ).subscribe({
          next: (customers: Customer[]) => {
            setLocalCustomers(customers);
            setLoading(false);
            Animated.timing(animation, {
              toValue: 1,
              duration: 300,
              useNativeDriver: false,
            }).start();
          },
          error: (err: any) => {
            console.log(err);
            setLoading(false);
          },
        });
        return () => subscription.unsubscribe();
      } else {
        Animated.timing(animation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start(() => setLocalCustomers([]));
      }
    }, [expanded, letter]);

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
          <Animated.View
            style={[styles.customersContainer, { flexGrow: expanded ? 1 : 0 }]}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#3b82f6" />
            ) : (
              localCustomers.map((customer) => (
                <CustomerListItem
                  key={customer.identificacion}
                  customer={customer}
                  onPress={() => onSelect(customer)}
                />
              ))
            )}
          </Animated.View>
        )}
      </View>
    );
  });

const styles = StyleSheet.create({
  groupContainer: {
    marginBottom: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  header: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  letterText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
  },
  customersContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    overflow: "hidden",
  },
});

export default CustomerGroupAccordion;
