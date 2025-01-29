import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useClients } from "@/context/ClientsContext";
import { router } from "expo-router";

const ClientSection = () => {
  const { selectedClient, clearClient } = useClients();

  return (
    <View className="bg-white rounded-lg p-4 mb-6 shadow-sm">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold">Cliente</Text>
        <TouchableOpacity
          className="flex-row items-center gap-2"
          onPress={() => router.navigate("/clients")}
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

      {selectedClient && (
        <View className="flex-row items-center justify-between bg-blue-50 p-3 rounded-lg">
          <Text className="text-base flex-1">{selectedClient.name}</Text>
          <TouchableOpacity onPress={clearClient}>
            <FontAwesome name="times-circle" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default ClientSection;