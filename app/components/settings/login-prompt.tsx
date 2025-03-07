import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const LoginPrompt = () => {
  return (
    <View className="w-full p-8 bg-white rounded-2xl shadow-lg shadow-black/20 mt-5">
      <View className="items-center mb-6">
        <Ionicons name="person" size={40} color="#F59E0B" />
        <Text className="text-center text-2xl font-bold text-gray-800 mb-3">
        Login
      </Text>
      </View>

      <Link href="/components/login" asChild>
        <TouchableOpacity
          className="py-4 px-6 bg-blue-500 rounded-xl shadow-md flex-row justify-center items-center"
        >
          <Ionicons name="log-in" size={20} color="white" />
          <Text className="text-white font-semibold text-lg ml-2">
            Ingresar
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
};

export default LoginPrompt;