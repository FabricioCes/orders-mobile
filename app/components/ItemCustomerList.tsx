import { FlatList, Text, StyleSheet } from "react-native";
import { Customer } from "@/types/customerTypes";
import CustomerListItem from "./customer-list-item";

const CustomerList: React.FC<{
  customers: Customer[];
  onSelect: (customer: Customer) => void;
  searchQuery: string;
}> = ({ customers, onSelect, searchQuery }) => (
  <FlatList
    data={customers}
    keyExtractor={(item) => item.identificacion.toString()}
    renderItem={({ item }) => (
      <CustomerListItem customer={item} onPress={onSelect} />
    )}
    contentContainerStyle={styles.listContent}
    ListEmptyComponent={
      <Text style={styles.emptyText}>
        {searchQuery ? "No hay resultados" : "No se encontraron customeres"}
      </Text>
    }
    keyboardDismissMode="on-drag"
  />
);

const styles = StyleSheet.create({

  listContent: {
    paddingBottom: 16,
  },
  emptyText: {
    textAlign: "center",
    color: "#64748b",
    fontSize: 16,
    marginTop: 20,
  }
});

export default CustomerList