import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { useClients } from '@/context/ClientsContext';
import { Client } from '@/types/types';
import { router } from 'expo-router';

export default function Clients() {
  const { clients, addClient } = useClients();
  const [searchQuery, setSearchQuery] = useState<string>("");

  function isPar(n: number) {
    return n % 2 === 0;
  }

  const handleSelectedClient = (client: Client) => {
    addClient(client);
    router.back();
  };

  const normalizeText = (text: string) =>
    text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const filteredClients = clients.filter(
    (client) =>
      normalizeText(client.name).includes(normalizeText(searchQuery)) ||
      normalizeText(client.ced).includes(normalizeText(searchQuery))
  );

  return (
    <View className="flex-1 items-center p-4">
      <Text className="self-start ml-8 text-lg mb-2 text-[#374151]">Nombre del Cliente</Text>
      <TextInput
        className="w-[320px] p-3 border border-gray-400 rounded-lg mb-4 bg-[#FFFFFFF] text-[#111827]"
        placeholder="Buscar por nombre o cédula"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        className="self-start p-6"
        data={filteredClients}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            className={`p-2 w-[320px] mb-3 rounded-md ${
              isPar(item.id) ? "bg-gray-300" : "bg-gray-200"
            }`}
            onPress={() => handleSelectedClient(item)}
          >
            <Text className="text-lg font-semibold text-gray-700">{item.name}</Text>
            <Text className="text-sm text-gray-500">{item.ced}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}