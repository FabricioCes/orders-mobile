import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { Order } from "@/types/types";

type OrderSummaryProps = {
  isActive: boolean;
  order: Order;
  handleSaveOrder: () => void;
};

const OrderSummaryItem: React.FC<OrderSummaryProps> = ({
  isActive,
  order,
  handleSaveOrder,
}) => {
  return (
    <View className="mt-6 bg-white rounded-lg p-4 shadow-sm">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-semibold">Resumen de la Orden</Text>
      </View>

      <View className="border-t border-gray-200 pt-4">
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600">Subtotal:</Text>
          <Text className="font-medium">
            ₡{order?.totalSinDescuento?.toFixed() || 0}
          </Text>
        </View>

        <View className="flex-row justify-between">
          <Text className="text-gray-600">Total:</Text>
          <Text className="text-xl font-bold text-blue-600">
            ₡{order?.totalSinDescuento?.toFixed() || 0}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        className="mt-6 bg-blue-500 p-4 rounded-lg flex-row items-center justify-center"
        onPress={handleSaveOrder}
      >
        <Text className="text-white font-bold text-lg mr-2">
          {isActive ? "Actualizar Orden" : "Confirmar Orden"}
        </Text>
        <AntDesign name="checkcircle" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default OrderSummaryItem;
