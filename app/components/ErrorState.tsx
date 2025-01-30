import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <View className="flex-1 justify-center items-center bg-white p-6">
      <Text className="text-red-600 text-lg font-semibold mb-4">
        Ocurrió un error
      </Text>
      <Text className="text-gray-600 text-center mb-4">{message}</Text>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          className="bg-blue-500 px-4 py-2 rounded-xl"
        >
          <Text className="text-white font-medium">Reintentar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ErrorState;
