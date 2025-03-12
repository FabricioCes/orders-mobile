import React, { useEffect, useState } from "react";
import { FlatList, Text, StyleSheet, View } from "react-native";
import { Customer, FirstCustomerLetter } from "@/types/customerTypes";
import CustomerListItem from "./customer-list-item";
import CustomerGroupAccordion from "./customer-group-accordion";
import { CustomerService } from "@/core/services/customer.service";
import { Subscription } from "rxjs";

interface CustomerListProps {
  customers?: Customer[];
  onSelect: (customer: Customer) => void;
  searchQuery?: string;
  grouped?: boolean;
}

const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  onSelect,
  searchQuery = "",
  grouped = false,
}) => {
  const [letters, setLetters] = useState<FirstCustomerLetter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let subscription: Subscription;

    if (grouped && searchQuery.trim() === "") { // Only fetch letters when not searching
      subscription = CustomerService.fetchAvailableLetters().subscribe({
        next: (data) => {
          setLetters(data);
          setLoading(false);
        },
        error: (err) => {
          console.log("Error fetching letters", err);
          setLoading(false);
        },
      });
    } else {
      setLoading(false); // No loading needed when showing filtered results
    }

    return () => {
      subscription?.unsubscribe();
    };
  }, [grouped, searchQuery]);

  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Cargando...</Text>
      </View>
    );
  }

  if (grouped && searchQuery.trim() === "") {
    return (
      <FlatList
        data={letters}
        keyExtractor={(item) => item.inicial}
        renderItem={({ item: letter }) => (
          <CustomerGroupAccordion letter={letter.inicial} onSelect={onSelect} />
        )}
        contentContainerStyle={styles.groupListContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No se encontraron clientes</Text>
        }
      />
    );
  }

  return (
    <FlatList
      data={customers}
      keyExtractor={(item) => item.identificacion.toString()}
      renderItem={({ item }) => (
        <CustomerListItem customer={item} onPress={onSelect} />
      )}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={
        <Text style={styles.emptyText}>
          {searchQuery ? "No hay resultados" : "No se encontraron clientes"}
        </Text>
      }
      keyboardDismissMode="on-drag"
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 16,
  },
  groupListContent: {
    padding: 16,
  },
  emptyText: {
    textAlign: "center",
    color: "#64748b",
    fontSize: 16,
    marginTop: 20,
  },
  emptyContainer: {
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CustomerList;