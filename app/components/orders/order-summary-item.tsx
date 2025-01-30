import React, { useEffect, useRef } from "react";
import { Animated, Easing, View, Text, TouchableOpacity } from "react-native";
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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  useEffect(() => {
    return () => {
      Animated.parallel([
        Animated.timing(fadeAnim,
          { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(slideAnim,
          { toValue: 100, duration: 400, useNativeDriver: true })
      ]).start();
    };
  }, []);
  const animatedStyles = {
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }],
  };
  return (
    <Animated.View
      className="bg-white border-t border-gray-200 p-4 shadow-lg"
      style={[
        animatedStyles,
        {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
      ]}
    >
      <View className="mt-6 bg-white rounded-lg p-4 shadow-sm border-t border-gray-200">
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
    </Animated.View>
  );
};

export default OrderSummaryItem;
