import { View, Text, TouchableOpacity, FlatList } from "react-native";
import ProductDetail from "../products/product-detail";
import { OrderDetail } from "@/types/types";

interface OrderDetailsListProps {
  orderDetails: OrderDetail[];
  onProductPress: (product: OrderDetail) => void;
}

export default function OrderDetailsList({
  orderDetails,
  onProductPress,
}: OrderDetailsListProps) {
  if (orderDetails.length === 0) {
    return (
      <View className="bg-gray-50 p-3 rounded-lg mx-4 mt-2">
        <Text className="text-gray-500 text-center">
          No hay productos seleccionados
        </Text>
      </View>
    );
  }
  return (
    <FlatList
      data={orderDetails}
      keyExtractor={(item) => item.identificadorOrdenDetalle.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => onProductPress(item)}
          className="mb-3 px-4"
        >
          <ProductDetail product={item} quantity={item.cantidad} />
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <View className="bg-gray-50 p-3 rounded-lg mx-4 mt-2">
          <Text className="text-gray-500 text-center">
            No hay productos seleccionados
          </Text>
        </View>
      }
    />
  )};