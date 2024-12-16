import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useSettings } from '@/context/SettingsContext';
import { Link, router } from 'expo-router';

export default function Tab() {
  const { saveSettings, logOut, settings, hasUser, userName } = useSettings(); // Acceder al contexto
  const [pcId, setPcId] = useState("");

  const handleSave = () => {
    if (pcId.trim() === "") {
      alert("Por favor, ingresa un ID válido");
      return;
    }
    saveSettings(pcId); // Guardar el valor en el contexto
    alert("ID guardado exitosamente");
  };

  const handleLogout = () => {
    logOut();
    router.navigate("/(tabs)")
  }

  return (
    <View className="flex-1 bg-gray-100 items-center p-5">
      <Text className="text-2xl font-bold text-blue-600 mb-5">Configuración</Text>

      <View className="w-full p-4 bg-white shadow-md rounded-lg mb-10">
        <Text className="text-lg font-semibold text-gray-700">ID Computadora</Text>
        <TextInput
          defaultValue={settings}
          className="border border-gray-300 rounded-lg h-12 mt-2 px-4 text-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-200"
          onChangeText={setPcId} // Actualizar el estado directamente
          placeholder="Escribe el ID de la computadora"
        />
        <TouchableOpacity
          className="bg-blue-500 mt-5 py-3 rounded-lg"
          onPress={handleSave} // Llamar la función al presionar
        >
          <Text className="text-white font-bold text-center">Guardar</Text>
        </TouchableOpacity>
      </View>

      {hasUser ? (
        <View className="w-full p-4 bg-white shadow-md rounded-lg">
          <Text className="text-lg font-semibold text-gray-700 mb-3">
            Sesión iniciada como: <Text className="text-blue-500">{userName}</Text>
          </Text>
          <TouchableOpacity className="bg-red-500 py-3 rounded-lg" onPress={() => handleLogout()}>
            <Text className="text-white font-bold text-center">Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="w-full p-5 bg-white shadow-md rounded-lg mt-5">
          <Text className="text-center text-red-500 font-semibold text-lg">
            Oops! No has iniciado sesión. 🚫
          </Text>
          <TouchableOpacity className="mt-5">
            <Link
              href="/login"
              className="py-3 px-4 bg-blue-500 text-white font-bold text-center rounded-lg"
            >
              Iniciar Sesión
            </Link>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}