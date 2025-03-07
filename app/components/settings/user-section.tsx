import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useSettings } from "@/core/context/SettingsContext";
import { Ionicons } from "@expo/vector-icons";

const UserSection = () => {
  const { logOut, userName } = useSettings();

  const handleLogout = () => {
    logOut();
    router.navigate("/components/login");
  };

  return (
    <View className="w-full p-8 bg-white rounded-2xl shadow-lg shadow-black/20 mt-5">
      {/* Ícono de usuario */}
      <View className="items-center mb-6">
        <Ionicons name="person" size={40} color="#F59E0B" />
      </View>

      {/* Texto de sesión */}
      <Text className="text-center text-2xl font-bold text-gray-800 mb-3">
        Sesión iniciada como: <Text className="text-blue-500">{userName}</Text>
      </Text>

      {/* Botón de cerrar sesión */}
      <TouchableOpacity
        onPress={handleLogout}
        className="bg-red-500 py-4 px-6 rounded-xl shadow-md flex-row justify-center items-center"
      >
        <Ionicons name="log-out" size={20} color="white" />
        <Text className="text-white font-semibold text-lg ml-2">
          Cerrar Sesión
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default UserSection;