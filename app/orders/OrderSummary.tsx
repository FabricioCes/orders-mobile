import React from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import { AntDesign, EvilIcons, FontAwesome } from "@expo/vector-icons";
import { OrderDetail } from "@/types/types";

type OrderSummaryProps = {
  orderDetails: OrderDetail[];
  selectedClient: any;
  removeFromOrder: (productId: number, detailId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  total: number;
  handleSaveOrder: () => void;
  clearClient: () => void;
  handleAddClient: () => void;
};

const OrderSummary: React.FC<OrderSummaryProps> = ({
  orderDetails,
  selectedClient,
  removeFromOrder,
  updateQuantity,
  total,
  handleSaveOrder,
  clearClient,
  handleAddClient,
}) => {
  return (
    <View className="mt-5 border-t border-t-gray-400 pt-2">
      <View>
        <View className={`${selectedClient ? "block" : "hidden"} flex-row items-center justify-between my-5`}>
          <View className="flex-row items-center">
            <Text>Cliente:</Text>
            <Text className="font-bold mx-2 text-lg">{selectedClient?.name}</Text>
          </View>
          <FontAwesome name="trash" size={20} className={`${selectedClient ? "block" : "hidden"}`} color="red" onPress={() => clearClient()} />
        </View>
        <TouchableOpacity className="p-2 rounded-md flex-row items-center gap-2 justify-center bg-blue-600" onPress={handleAddClient}>
          <Text className="font-semibold tracking-wide text-white">{selectedClient ? "Cambiar Cliente" : "Agregar Cliente"}</Text>
          {selectedClient ? <FontAwesome name="exchange" color="white" size={18} /> : <AntDesign name="plus" color="white" size={18} />}
        </TouchableOpacity>
      </View>

      <Text className="text-2xl font-semibold tracking-wide py-5">Orden:</Text>
      {orderDetails.map((item) => (
        <View key={item.idProducto} style={styles.orderItem}>
          <View style={styles.orderDetails}>
            <Text>{item.nombreProducto}</Text>
            <Text>{`₡${item.precio.toFixed()}`}</Text>
          </View>
          <TextInput
            className="border border-gray-400 px-5 text-center mr-2 h-full rounded-lg"
            keyboardType="numeric"
            defaultValue={String(item.cantidad)}
            value={String(item.cantidad)}
            onChangeText={(text) => {
              const newQuantity = text === "" ? 0 : Math.max(0, parseInt(text, 10));
              if (!isNaN(newQuantity)) {
                updateQuantity(item.idProducto, newQuantity);
              }
            }}
          />
          <TouchableOpacity
            className="bg-red-500 p-3 rounded-md flex-row items-center"
            onPress={() => removeFromOrder(item.idProducto, item.identificadorOrdenDetalle)}
          >
            <Text className="text-white font-bold">Eliminar</Text>
            <EvilIcons name="trash" size={25} color="white" />
          </TouchableOpacity>
        </View>
      ))}

      <View className="container my-4">
        <Text className="text-2xl font-bold">Total: ₡{total.toFixed()}</Text>
      </View>
      <View className="mt-5 items-center">
        <TouchableOpacity
          className="bg-blue-500 p-3 rounded-lg flex-row items-center gap-2"
          onPress={handleSaveOrder}
        >
          <Text className="text-white font-bold text-xl">Guardar Orden</Text>
          <AntDesign name="check" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  orderDetails: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default OrderSummary;
