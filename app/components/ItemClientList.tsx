import { FlatList, Text, StyleSheet } from "react-native";
import { Client } from "@/types/clientTypes";
import ClientListItem from "./client-list-item";

const ClientList: React.FC<{
  clients: Client[];
  onSelect: (client: Client) => void;
  searchQuery: string;
}> = ({ clients, onSelect, searchQuery }) => (
  <FlatList
    data={clients}
    keyExtractor={(item) => item.identificacion.toString()}
    renderItem={({ item }) => (
      <ClientListItem client={item} onPress={onSelect} />
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

export default ClientList