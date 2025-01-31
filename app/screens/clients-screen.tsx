import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useClients } from "@/context/ClientsContext";
import { router } from "expo-router";
import { Client } from "@/types/clientTypes";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import SearchBarClient from "../components/search-bar-clients";
import useClientSearch from "@/hooks/usClientSearch";
import ClientList from "../components/ItemClientList";

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
      <SearchBarClient value={searchQuery} onChangeText={setSearchQuery} />

      {status === "loading" && <LoadingState message="Cargando clientes..." />}
      {status === "error" && <ErrorState message="Erro al cargar clientes"/>}

      <ClientList
        clients={filteredClients}
        onSelect={handleSelect}
        searchQuery={searchQuery}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8fafc",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  }
});

export default ClientsScreen;
