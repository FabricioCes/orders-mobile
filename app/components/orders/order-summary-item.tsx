import React, { useEffect, useRef } from "react";
import { Animated, Easing, View, Text, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";

type OrderSummaryItemProps = {
  total: number;
  itemsCount: number;
  onSave: () => void;
  isActive: boolean;
  isSaving?: boolean;
};

const OrderSummaryItem: React.FC<OrderSummaryItemProps> = ({
  total,
  itemsCount,
  onSave,
  isActive,
  isSaving = false
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

    return () => {
      // Reset animations on unmount
      fadeAnim.setValue(0);
      slideAnim.setValue(100);
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
          <Text className="text-gray-500">{itemsCount} items</Text>
        </View>

        <View className="border-t border-gray-200 pt-4">
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Subtotal:</Text>
            <Text className="font-medium">₡{total.toFixed(2)}</Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-gray-600">Total:</Text>
            <Text className="text-xl font-bold text-blue-600">
              ₡{total.toFixed(2)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          className={`mt-6 p-4 rounded-lg flex-row items-center justify-center ${
            isSaving ? "bg-blue-400" : "bg-blue-500"
          }`}
          onPress={onSave}
          disabled={isSaving}
        >
          <Text className="text-white font-bold text-lg mr-2">
            {isSaving ? (
              "Guardando..."
            ) : isActive ? (
              "Actualizar Orden"
            ) : (
              "Confirmar Orden"
            )}
          </Text>
          {!isSaving && <AntDesign name="checkcircle" size={20} color="white" />}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default OrderSummaryItem;