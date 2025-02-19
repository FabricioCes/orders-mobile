import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useSettings } from "@/app/context/SettingsContext";


const UserSection = () => {
  const { logOut, userName } = useSettings();

  const handleLogout = () => {
    logOut();
    router.navigate("/components/login");
  };

  return (
    <View className="w-full p-4 bg-white shadow-md rounded-lg">
      <Text className="text-lg font-semibold text-gray-700 mb-3">
        Sesión iniciada como: <Text className="text-blue-500">{userName}</Text>
      </Text>
      <TouchableOpacity
        onPress={handleLogout}
        className="bg-red-500 py-3 rounded-lg"
      >
        <Text className="text-white font-bold text-center">Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

export default UserSection;
