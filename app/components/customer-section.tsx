import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useCustomer } from "@/app/context/CustomerContext";
import { router } from "expo-router";
import { CustomerApiRepository } from "@/core/repositories/customer.repository";

type CustomerSectionProps = {
  customerId: number;
  orderId: number;
};

const CustomerSection: React.FC<CustomerSectionProps> = ({ customerId, orderId }) => {
  const { state, dispatch } = useCustomer();
  const [loadingCustomer, setLoadingCustomer] = useState(true);

  const { selectedCustomer } = state;

  useEffect(() => {
    dispatch({ type: "CLEAR_SELECTED_CUSTOMER" });
  }, [orderId, dispatch]);

  useEffect(() => {
    console.log("customer id",customerId)
    if (customerId) {
      setLoadingCustomer(true);
      CustomerApiRepository.getCustomer(customerId)
        .then((client) => {
          dispatch({ type: "SET_SELECTED_CUSTOMER", payload: client });
        })
        .catch(() => {
          dispatch({ type: "CLEAR_SELECTED_CUSTOMER" });
        })
        .finally(() => setLoadingCustomer(false));
    }
  }, [customerId, dispatch]);

  if (loadingCustomer && customerId) {
    return <ActivityIndicator size="small" />;
  }

  return (
    <View className="bg-white rounded-lg p-4 mb-6 shadow-sm border-t border-gray-200 mt-2">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold">Cliente</Text>
        <TouchableOpacity
          className="flex-row items-center gap-2"
          onPress={() => router.navigate("/screens/customers-screen")}
        >
          <FontAwesome
            name={selectedCustomer ? "exchange" : "plus"}
            size={16}
            color="#3b82f6"
          />
          <Text className="text-blue-500 font-medium">
            {selectedCustomer ? "Cambiar" : "Agregar"}
          </Text>
        </TouchableOpacity>
      </View>

      {selectedCustomer && (
        <View className="flex-row items-center justify-between bg-blue-50 p-3 rounded-lg">
          <Text className="text-base flex-1">{selectedCustomer.nombre}</Text>
          <TouchableOpacity onPress={() => dispatch({ type: "CLEAR_SELECTED_CUSTOMER" })}>
            <FontAwesome name="times-circle" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default CustomerSection;
