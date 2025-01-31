import React from "react";
import { ActivityIndicator, View, Text } from "react-native";

type LoadingStateProps = {
  message: string;
};

const LoadingState: React.FC<LoadingStateProps> = ({ message = "Cargando, por favor espera..."}) => {
  return (
    <View className="flex-1 justify-center items-center bg-white p-6">
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text className="text-gray-600 mt-4">{message}</Text>
    </View>
  );
};

export default LoadingState;
