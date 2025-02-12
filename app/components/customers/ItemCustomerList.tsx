// CustomerList.tsx
import React, { useMemo } from "react";
import { FlatList, Text, StyleSheet, View } from "react-native";
import { Customer } from "@/types/customerTypes";
import CustomerListItem from "./customer-list-item";
import CustomerGroupAccordion from "./customer-group-accordion";

interface CustomerListProps {
  customers?: Customer[];
  onSelect: (customer: Customer) => void;
  searchQuery?: string;
  grouped?: boolean;
}

const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  onSelect,
  searchQuery="",
  grouped = false,
}) => {
  if (grouped) {

    const letters = useMemo(() => "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""), []);

    return (
      <FlatList
        data={letters}
        keyExtractor={(item) => item}
        renderItem={({ item: letter }) => (
          <CustomerGroupAccordion
            letter={letter}
            onSelect={onSelect}
          />
        )}
        contentContainerStyle={styles.groupListContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {searchQuery ? "No hay resultados" : "No se encontraron clientes"}
          </Text>
        }
      />
    );
  } else {
    if (!customers) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No se encontraron clientes</Text>
        </View>
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
  }
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
