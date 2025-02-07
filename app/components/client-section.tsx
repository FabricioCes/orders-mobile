import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useClients } from "@/context/ClientsContext";
import { router } from "expo-router";
import { CustomerApiRepository } from "@/repositories/customer.repository";
type ClientSectionProps = {
  customerId: number;
};

const ClientSection: React.FC<ClientSectionProps> = ({ customerId }) => {
  const { selectedClient, clearClient, addClient} = useClients();
  console.log(customerId)
 CustomerApiRepository.getCustomer(customerId).then(client => addClient(client));
  return (
    <View className="bg-white rounded-lg p-4 mb-6 shadow-sm border-t border-gray-200 mt-2" >
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold">Cliente</Text>
        <TouchableOpacity
          className="flex-row items-center gap-2"
          onPress={() => router.navigate("/screens/clients-screen")}
        >
          <FontAwesome
            name={selectedClient ? "exchange" : "plus"}
            size={16}
            color="#3b82f6"
          />
          <Text className="text-blue-500 font-medium">
            {selectedClient ? "Cambiar" : "Agregar"}
          </Text>
        </TouchableOpacity>
      </View>

      {(selectedClient) && (
        <View className="flex-row items-center justify-between bg-blue-50 p-3 rounded-lg">
          <Text className="text-base flex-1">{selectedClient?.nombre}</Text>
          <TouchableOpacity onPress={clearClient}>
            <FontAwesome name="times-circle" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default ClientSection;