import React from "react";
import { View, Text } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

type TableItemProps = {
  tableNumber: number;
  isActive: boolean;
  testID?: string;
};

const TableItem = ({ tableNumber, isActive, testID }: TableItemProps) => (
  <View
    testID={testID}
    className={`p-4 rounded-lg flex justify-center items-center w-24 h-24 mx-2 ${
      isActive ? "bg-red-400/80" : "bg-blue-400/80"
    }`}
  >
    <FontAwesome5
      name="chair"
      color={isActive ? "#b91c1c" : "white"}
      size={24}
      accessibilityRole="image"
      accessibilityLabel={`Silla de la mesa ${tableNumber}`}
    />
    <Text
      className={`text-center font-medium mt-2 ${
        isActive ? "text-red-700" : "text-white"
      }`}
      accessibilityRole="text"
    >
      Mesa {tableNumber}
    </Text>
  </View>
);

export default React.memo(TableItem);
