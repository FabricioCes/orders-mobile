import React, { useState } from "react";
import { View, Text, TextInput, FlatList, StyleSheet } from "react-native";
import { useClients } from "@/context/ClientsContext";
import ClientListItem from "../components/client-list-item";
import { router } from "expo-router";
import { Client } from "@/types/clientTypes";

const ClientsScreen: React.FC = () => {
  const { clients, status, addClient } = useClients();
  const [searchQuery, setSearchQuery] = useState("");
  const filteredClients = useClientSearch(clients, searchQuery);

  const handleSelect = (client: Client) => {
    addClient(client);
    router.back();
  };

  return (
    <View style={styles.container}>
      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

      {status === "loading" && <LoadingIndicator />}
      {status === "error" && <ErrorState />}

      <ClientList
        clients={filteredClients}
        onSelect={handleSelect}
        searchQuery={searchQuery}
      />
    </View>
  );
};

// Componentes secundarios
const SearchBar: React.FC<{
  value: string;
  onChangeText: (text: string) => void;
}> = ({ value, onChangeText }) => (
  <TextInput
    style={styles.searchInput}
    placeholder="Buscar por nombre o cédula"
    placeholderTextColor="#94a3b8"
    value={value}
    onChangeText={onChangeText}
    accessibilityLabel="Buscar clientes"
  />
);

const LoadingIndicator = () => (
  <View style={styles.centerContainer}>
    <Text style={styles.loadingText}>Cargando clientes...</Text>
  </View>
);

const ErrorState = () => (
  <View style={styles.centerContainer}>
    <Text style={styles.errorText}>Error cargando clientes</Text>
  </View>
);

const ClientList: React.FC<{
  clients: Client[];
  onSelect: (client: Client) => void;
  searchQuery: string;
}> = ({ clients, onSelect, searchQuery }) => (
  <FlatList
    data={clients}
    keyExtractor={(item) => item.id.toString()}
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

// Hook optimizado para búsqueda
const useClientSearch = (clients: Client[], query: string) => {
  return React.useMemo(() => {
    const normalizedQuery = query
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(normalizedQuery) ||
        client.ced.includes(normalizedQuery)
    );
  }, [clients, query]);
};

// Estilos consolidados
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8fafc",
  },
  searchInput: {
    height: 48,
    borderWidth: 1,
    borderColor: "#c7d2fe",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#fff",
    color: "#1e293b",
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyText: {
    textAlign: "center",
    color: "#64748b",
    fontSize: 16,
    marginTop: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#334155",
    fontSize: 16,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 16,
  },
});

export default ClientsScreen;
