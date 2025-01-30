import React from "react";
import { ActivityIndicator, View, Text } from "react-native";

const LoadingState: React.FC = () => {
  return (
    <View className="flex-1 justify-center items-center bg-white p-6">
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text className="text-gray-600 mt-4">Cargando, por favor espera...</Text>
    </View>
  );
};

export default LoadingState;
