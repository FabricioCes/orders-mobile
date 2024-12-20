import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native'
import React from 'react'

export default function Clients() {

  const data = [
    { i: 1, id: "0-1234-5678", name: "Devin Morales" },
    { i: 2, id: "302-01-2345", name: "Dan Logistics S.A." },
    { i: 3, id: "0-9876-5432", name: "Dominic Fernández" },
    { i: 4, id: "302-03-5678", name: "Jackson Enterprises" },
    { i: 5, id: "0-6543-2109", name: "James Rodríguez" },
    { i: 4, id: "302-04-6789", name: "Joel Corp." },
    { i: 7, id: "0-3210-7654", name: "John Smith" },
    { i: 8, id: "302-05-7890", name: "Jillian Marketing" },
    { i: 9, id: "0-4321-8765", name: "Jimmy Cruz" },
    { i: 10, id: "302-06-8901", name: "Julie Foods S.A." },
    { i: 11, id: "0-1234-9876", name: "Mario Vargas" },
    { i: 12, id: "302-07-6543", name: "Luisa Diseño Ltda." },
    { i: 13, id: "0-5678-1234", name: "Carlos López" },
    { i: 14, id: "302-08-4321", name: "Patricia Exportaciones" },
    { i: 15, id: "0-8765-4321", name: "Andrés Gutiérrez" },
    { i: 16, id: "302-09-5432", name: "Marta Construcciones" },
    { i: 17, id: "0-3456-7890", name: "Fernando Pérez" },
    { i: 18, id: "302-10-2109", name: "Sofía Tecnología S.A." },
    { i: 19, id: "0-7890-1234", name: "Laura Gómez" },
    { i: 20, id: "302-11-3456", name: "Tomás Innovaciones" },
  ];

  function isPar(n: number){
    return n % 2 === 0;
  }

  return (
    <View className='flex-1 items-center p-4'>
      <Text className='self-start ml-8 text-lg mb-2 text-[#374151]'>Nombre del Cliente</Text>
      <TextInput className='w-[320px] p-3 border border-gray-400 rounded-lg mb-4 bg-[#FFFFFFF] text-[#111827]' />

      <FlatList
      className='self-start p-6'
        data={data}
        renderItem={({item}) =>
        <TouchableOpacity className={`p-2  w-[320px] mb-3 rounded-md ${isPar(item.i) ? "bg-gray-300" : "bg-gray-200"}`}>
          <Text className='text-lg font-semibold text-gray-700'>{item.name}</Text>
        </TouchableOpacity>
        }
      />
    </View>
  )
}