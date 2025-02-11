import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Customer } from "@/types/customerTypes";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import SearchBarCustomer from "../components/search-bar-customer";
import useCustomerSearch from "@/app/hooks/usCustomerSearch";
import CustomerList from "../components/ItemCustomerList";
import { useCustomer } from "@/app/context/CustomerContext";
import { useSettings } from "../context/SettingsContext";

const CustomersScreen: React.FC = () => {
   const { settings, token} = useSettings();
  const { state, dispatch } = useCustomer();
  const { customers, status } = state;
  const [searchQuery, setSearchQuery] = useState("");
  const filteredCustomers = useCustomerSearch(customers, searchQuery);
  const {fetchCustomers} = useCustomer();

  const handleSelect = (customer: Customer) => {
    console.log("customer",customer)
    dispatch({ type: "SET_SELECTED_CUSTOMER", payload: customer });
    router.back();
  };
    useEffect(() => {
      const controller = new AbortController();
      if (token && settings) {
        fetchCustomers(controller.signal);
      }
      return () => controller.abort();
    }, [token, settings]);

  return (
    <View style={styles.container}>
      <SearchBarCustomer value={searchQuery} onChangeText={setSearchQuery} />

      {status === "loading" && (
        <LoadingState message="Cargando clientes..." />
      )}
      {status === "error" && (
        <ErrorState message="Error al cargar clientes" />
      )}

      <CustomerList
        customers={filteredCustomers}
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
  },
});

export default CustomersScreen;
