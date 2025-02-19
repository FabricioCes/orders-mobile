// CustomersScreen.tsx
import React, { useState, useEffect } from "react";
import { View, StyleSheet} from "react-native";
import { router } from "expo-router";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import SearchBarCustomer from "../components/customers/search-bar-customer";
import { useCustomer } from "@/app/context/CustomerContext";
import { useSettings } from "../context/SettingsContext";
import { Customer } from "@/types/customerTypes";
import CustomerList from "../components/customers/ItemCustomerList";
import useCustomerSearch from "../hooks/usCustomerSearch";

const CustomersScreen: React.FC = () => {
  const { settings, token } = useSettings();
  const { state, dispatch, fetchCustomers } = useCustomer();
  const { customers, status } = state;
  const [searchQuery, setSearchQuery] = useState("");
  const filteredCustomers = useCustomerSearch(customers, searchQuery);

  const handleSelect = (customer: Customer) => {
    dispatch({ type: "SET_SELECTED_CUSTOMER", payload: customer });
    router.back();
  };

  useEffect(() => {
    const controller = new AbortController();
    if (token && settings) {
      fetchCustomers(controller.signal);
    }
    return () => controller.abort();
  }, [token, settings, fetchCustomers]);


  return (
    <View style={styles.container}>
      <SearchBarCustomer value={searchQuery} onChangeText={setSearchQuery} />

      {status === "loading" && <LoadingState message="Cargando clientes..." />}
      {status === "error" && <ErrorState message="Error al cargar clientes" />}

      {searchQuery.trim() === "" ? (
       <CustomerList customers={customers} grouped={true} searchQuery={searchQuery} onSelect={handleSelect}/>
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
