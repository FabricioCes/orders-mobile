import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

type TableItemProps = {
  tableNumber: number;
  isActive: boolean;
  onPress: () => void;
};

const TableItem = ({ tableNumber, isActive, onPress }: TableItemProps) => (
  <TouchableOpacity
    onPress={onPress}
    className={`p-4 rounded-lg flex justify-center items-center w-24 h-24 mx-2 ${
      isActive ? "bg-red-400/80" : "bg-blue-400/80"
    }`}
  >
    <FontAwesome5
      name="chair"
      color={isActive ? "#b91c1c" : "white"}
      size={24}
    />
    <Text
      className={`text-center font-medium mt-2 ${
        isActive ? "text-red-700" : "text-white"
      }`}
    >
      Mesa {tableNumber}
    </Text>
  </TouchableOpacity>
);

export default TableItem;