import React from "react";
import { View, Text } from "react-native";
import { Link } from "expo-router";

const LoginPrompt = () => {
  return (
    <View className="w-full p-5 bg-white shadow-md rounded-lg mt-5">
      <Text className="text-center text-red-500 font-semibold text-lg">
        Oops! No has iniciado sesión. ⚠️
      </Text>
      <Link
        href="/components/login"
        className="mt-5 py-3 px-4 bg-blue-500 text-white font-bold text-center rounded-lg"
      >
        Iniciar Sesión
      </Link>
    </View>
  );
};

export default LoginPrompt;
