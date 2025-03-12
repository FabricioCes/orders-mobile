import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { router } from "expo-router";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import SearchBarClient from "../components/customers/search-bar-customer"; // Renamed import to match file
import {
  useCustomers,
  useSelectedCustomer,
} from "@/core/context/CustomerContext"; // Updated import
import { Customer } from "@/types/customerTypes";
import CustomerList from "../components/customers/ItemCustomerList";
import useCustomerSearch from "../../core/hooks/useCustomerSearch";

const CustomersScreen: React.FC = () => {
  const { data: customers, isLoading, error } = useCustomers();
  const { setSelectedCustomer } = useSelectedCustomer(); // Use context to set selected customer
  const [searchQuery, setSearchQuery] = useState("");
  const filteredCustomers = useCustomerSearch(customers || [], searchQuery);

  const handleSelect = (customer: Customer) => {
    setSelectedCustomer(customer); // Set the selected customer in context
    router.back(); // Navigate back after selection
  };

  const handleClearSearch = () => {
    setSearchQuery(""); // Clear the search query
  };

  if (isLoading) {
    return <LoadingState message="Cargando clientes..." />;
  }

  if (error) {
    return <ErrorState message="Error al cargar clientes" />;
  }

  return (
    <View style={styles.container}>
      <SearchBarClient
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={handleClearSearch} // Added clear functionality
      />

      {searchQuery.trim() === "" ? (
        <CustomerList
          customers={customers || []}
          grouped={true}
          searchQuery={searchQuery}
          onSelect={handleSelect}
        />
      ) : (
        <CustomerList
          customers={filteredCustomers}
          onSelect={handleSelect}
          searchQuery={searchQuery}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8fafc",
  },
});

export default CustomersScreen;
