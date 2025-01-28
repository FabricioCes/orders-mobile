import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useClients } from "@/context/ClientsContext";
import { Client } from "@/types/types";
import { router } from "expo-router";

// Componente para ítem de cliente
const ClientListItem = ({
  client,
  onPress,
}: {
  client: Client;
  onPress: (client: Client) => void;
}) => (
  <TouchableOpacity
    style={[styles.itemContainer, client.id % 2 === 0 && styles.evenBackground]}
    onPress={() => onPress(client)}
    accessibilityRole="button"
  >
    <Text style={styles.nameText}>{client.name}</Text>
    <Text style={styles.cedText}>{client.ced}</Text>
  </TouchableOpacity>
);

// Hook personalizado para búsqueda (se mantiene igual)
const useClientSearch = (clients: Client[], searchQuery: string) => {
  const normalizeText = (text: string) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  return clients.filter((client) => {
    const normalizedQuery = normalizeText(searchQuery);
    return (
      normalizeText(client.name).includes(normalizedQuery) ||
      normalizeText(client.ced).includes(normalizedQuery)
    );
  });
};

// Componente principal
export default function ClientsScreen() {
  const { clients, addClient } = useClients();
  const [searchQuery, setSearchQuery] = useState("");
  const filteredClients = useClientSearch(clients, searchQuery);

  const handleClientSelection = (client: Client) => {
    addClient(client);
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nombre del Cliente</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por nombre o cédula"
        placeholderTextColor="#94a3b8"
        value={searchQuery}
        onChangeText={setSearchQuery}
        accessibilityLabel="Buscar clientes"
      />

      <View style={styles.listContent}>
        <TouchableOpacity
          className={`${searchQuery.length <= 0 ? "hidden" : "block"}`}
          style={styles.itemContainer}
          accessibilityRole="button"
        >
          <Text style={styles.nameText}>{searchQuery.length <= 0 ? "Sin Nombre" : searchQuery}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredClients}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ClientListItem client={item} onPress={handleClientSelection} />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No se encontraron clientes</Text>
        }
      />
    </View>
  );
}

// Estilos actualizados con nueva paleta
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  label: {
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 8,
    marginLeft: 8,
    fontWeight: '500',
  },
  searchInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#c7d2fe',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    color: '#1e293b',
    fontSize: 16,
  },
  listContent: {
    padding: 16,
  },
  itemContainer: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#e0e7ff',
    shadowColor: '#818cf8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  evenBackground: {
    backgroundColor: '#ede9fe',
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4338ca',
  },
  cedText: {
    fontSize: 14,
    color: '#4f46e5',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 16,
    marginTop: 20,
  },
});