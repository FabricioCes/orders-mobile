import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native'
import React from 'react'
import { useClients } from '@/context/ClientsContext';
import { Client } from '@/types/types';
import { router } from 'expo-router';


export default function Clients() {
 
  const {clients, addClient} = useClients();

  function isPar(n: number){
    return n % 2 === 0;
  }

  const handleSelectedClient = (client: Client) => {
    addClient(client);
    router.back();
  }

  return (
    <View className='flex-1 items-center p-4'>
      <Text className='self-start ml-8 text-lg mb-2 text-[#374151]'>Nombre del Cliente</Text>
      <TextInput className='w-[320px] p-3 border border-gray-400 rounded-lg mb-4 bg-[#FFFFFFF] text-[#111827]' />

      <FlatList
      className='self-start p-6'
        data={clients}
        renderItem={({item}) =>
        <TouchableOpacity className={`p-2  w-[320px] mb-3 rounded-md ${isPar(item.id) ? "bg-gray-300" : "bg-gray-200"}`} onPress={() => handleSelectedClient(item)}>
          <Text className='text-lg font-semibold text-gray-700'>{item.name}</Text>
        </TouchableOpacity>
        }
      />
    </View>
  )
}