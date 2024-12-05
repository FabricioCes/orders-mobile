import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useSettings } from '@/context/SettingsContext';

export default function Tab() {
  const { saveSettings } = useSettings(); // Acceder al contexto
  const [pcId, setPcId] = useState("");

  const handleSave = () => {
    if (pcId.trim() === "") {
      alert("Por favor, ingresa un ID válido");
      return;
    }
    saveSettings(pcId); // Guardar el valor en el contexto
    alert("ID guardado exitosamente");
  };

  return (
    <View className="flex-1 container items-center p-5">
      <Text>Id Computadora</Text>
      <TextInput
        className="border rounded-lg border-gray-400 focus:border-blue-400 h-10 mt-2 w-10/12 p-2"
        value={pcId}
        onChangeText={setPcId} // Actualizar el estado directamente
        placeholder="Escribe el ID de la computadora"
      />
      <TouchableOpacity
        className="bg-blue-400 mt-5 p-5 rounded-lg"
        onPress={handleSave} // Llamar la función al presionar
      >
        <Text className="text-white font-bold text-xl">Guardar</Text>
      </TouchableOpacity>
    </View>
  );
}