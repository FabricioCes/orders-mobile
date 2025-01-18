import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";

import React, { useState, useEffect, useRef } from "react";
import { AntDesign, EvilIcons, FontAwesome } from "@expo/vector-icons";
import { Order, OrderDetail, Product } from "@/types/types";
import { useOrder } from "@/context/OrderContext";
import { useProducts } from "@/context/ProductsContext"; // Importa el contexto de productos
import { router } from "expo-router";
import { useClients } from "@/context/ClientsContext";
import { useSettings } from "@/context/SettingsContext";

type Props = {
  tableId: number;
  place: string;
  isActive: boolean;
}

export default function Menu({ tableId, place, isActive }: Props) {

  const [expandedSubCategory, setExpandedSubCategory] = useState<string | null>(null);
  const [expandedSubSubCategory, setExpandedSubSubCategory] = useState<string | null>(null);
  const { saveOrder } = useOrder();
  const { selectedClient, clearClient } = useClients();
  const { orderedProducts } = useProducts();
  const { userName } = useSettings();

  const [order, setOrder] = useState<Order>({
    numeroOrden: 0,
    numeroLugar: tableId.toString(),
    ubicacion: place.toUpperCase(),
    observaciones: "",
    nombreCliente: "",
    idCliente: 0,
    idUsuario: userName,
    autorizado: true,
    totalSinDescuento: 0,
    detalles: [],
    listaEliminacion:[0]
  });
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Normalizar texto para la búsqueda
  const normalizeText = (text: string) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  // Filtrar productos
  const filteredMenu = orderedProducts.map((subCategory) => ({
    ...subCategory,
    subSubCategories: subCategory.subSubCategories.map((subSubCategory) => ({
      ...subSubCategory,
      products: subSubCategory.products.filter((product) =>
        normalizeText(product.name).includes(normalizeText(searchQuery))
      ),
    })),
  }));

  // Expandir automáticamente las categorías
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setExpandedSubCategory(null);
      setExpandedSubSubCategory(null);
    } else {
      for (const subCategory of filteredMenu) {
        for (const subSubCategory of subCategory.subSubCategories) {
          if (subSubCategory.products.length > 0) {
            setExpandedSubCategory(subCategory.name);
            setExpandedSubSubCategory(subSubCategory.name);
            return;
          }
        }
      }
    }
  }, [searchQuery]);

  //actualizar cliente de la orden

  useEffect(() => {
    if (selectedClient) {
      setOrder((prevOrder) => ({
        ...prevOrder,
        nombreCliente: selectedClient.name || "Cliente",
        idCliente: selectedClient.id || 1000,
      }));
    }
  }, [selectedClient]);

  // Agregar producto a la orden
  const addToOrder = (product: Product) => {
    setOrderDetails((prevDetails) => {
      const existingDetail = prevDetails.find((detail) => detail.idProducto === product.id);

      if (existingDetail) {
        return prevDetails.map((detail) =>
          detail.idProducto === product.id
            ? { ...detail, qty: detail.cantidad + 1 }
            : detail
        );
      }

      const newDetail: OrderDetail = {
        idProducto: product.id,
        nombreProducto: product.name,
        cantidad: 1,
        precio: product.price,
        porcentajeDescProducto: 0,
        ingrediente: false,
        quitarIngrediente: false,
      };

      return [...prevDetails, newDetail];
    });
  };
  // Eliminar producto de la orden
  const removeFromOrder = (productId: number) => {
    setOrderDetails((prevDetails) => prevDetails.filter((detail) => detail.idProducto !== productId));
  };

  useEffect(() => {
    if (orderDetails.length === 0) clearClient()
  }, [orderDetails])

  // Actualizar el total de la orden cada vez que cambien los detalles
  useEffect(() => {
    const total = orderDetails.reduce(
      (acc, detail) => acc + detail.cantidad * detail.precio,
      0
    );
    setOrder((prevOrder) => ({
      ...prevOrder,
      totalSinDescuento: total,
    }));
  }, [orderDetails]);

  // Actualizar cantidad de un producto
  const updateQuantity = (productId: number, quantity: number) => {
    setOrderDetails((prevDetails) =>
      prevDetails.map((detail) =>
        detail.idProducto === productId
          ? { ...detail, cantidad: Math.max(0, quantity) }
          : detail
      )
    );
  };

  const handleSaveOrder = () => {
    // Validar que no haya productos con cantidad 0
    const invalidItems = orderDetails.filter((detail) => detail.cantidad === 0);
    if (invalidItems.length > 0) {
      Alert.alert(
        "Error",
        "No puedes guardar la orden con productos en cantidad 0. Por favor, verifica los productos."
      );
      return;
    }
  
    // Si todo está bien, guarda la orden
    const completeOrder = {
      ...order,
      detalles: orderDetails,
    };
  
    saveOrder(completeOrder); // Llamar al contexto para guardar la orden
    clearClient(); // Limpiar cliente seleccionado
  };
  const handleAddClient = () => {
    router.navigate("/clients");
  }

  const scrollViewRef = useRef<ScrollView>(null);

  const handleFocus = () => {
    // Desplaza hacia el final del ScrollView
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  return (
    <View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView className="container mx-auto p-5"
          contentContainerStyle={{ paddingBottom: 160}}
          keyboardShouldPersistTaps="handled"
          ref={scrollViewRef}
        >
          <Text className="font-bold text-2xl">Menú</Text>

          {/* Campo de búsqueda */}
          <TextInput
            className={`border rounded-md p-3 mb-2 ${!filteredMenu.length ? "border-red-400" : "border-gray-400"}`}
            placeholder="Buscar producto..."
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
          />

          {!filteredMenu.length && (
            <Text className="text-center text-gray-400">No se encontraron productos.</Text>
          )}

          {filteredMenu.map((subCategory) => (
            <View key={subCategory.name} className="my-3">
              {/* Subcategoría */}
              <TouchableOpacity
                onPress={() =>
                  setExpandedSubCategory((prev) =>
                    prev === subCategory.name ? null : subCategory.name
                  )
                }
              >
                <View className="flex-row items-center gap-5">
                  <Text className="text-xl font-bold text-[#007BFF]">{subCategory.name}</Text>
                  <FontAwesome name={expandedSubCategory === subCategory.name ? "caret-right" : "caret-down"} color="#007BFF" size={20} />
                </View>
              </TouchableOpacity>

              {/* SubSubCategorías */}
              {expandedSubCategory === subCategory.name &&
                subCategory.subSubCategories.map((subSubCategory) => (
                  <View key={subSubCategory.name} className="m-2">
                    <TouchableOpacity
                      onPress={() =>
                        setExpandedSubSubCategory((prev) =>
                          prev === subSubCategory.name ? null : subSubCategory.name
                        )
                      }
                    >
                      <View className="flex-row items-center gap-5">
                        <Text className="text-[#0056B3] min-w-[250px]">{subSubCategory.name}</Text>
                        <FontAwesome name={expandedSubSubCategory === subSubCategory.name ? "caret-right" : "caret-down"} color="#0056B3" size={20} />
                      </View>

                    </TouchableOpacity>

                    {/* Productos */}
                    {expandedSubSubCategory === subSubCategory.name &&
                      subSubCategory.products.map((product) => (

                        <View key={product.id} className="mx-2 flex-row justify-between items-center my-1 mt-4">
                          <Text className="flex-1">{product.name}</Text>
                          <Text className="mx-4">{`₡${product.price}`}</Text>
                          <TouchableOpacity
                            className="bg-[#007BFF] p-3 rounded-md"
                            onPress={() =>
                              addToOrder({
                                id: product.id,
                                name: product.name,
                                price: product.price,
                                idSubCategoria: 0,
                                subCategoria: "",
                                idSubSubCategoria: 0,
                                subSubCategoria: "",
                                quantity: 1,
                              })
                            }
                          >
                            <Text className="font-bold text-white">Agregar</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                  </View>
                ))}
            </View>
          ))}

          {/* Orden */}
          {order && orderDetails.length > 0 ? (
            <View className="mt-5 border-t border-t-gray-400 pt-2">
              <View>
                <View className={`${selectedClient ? "block" : "hidden"} flex-row items-center justify-between my-5`}>
                  <View className={`flex-row items-center`}>
                    <Text>Cliente:</Text>
                    <Text className="font-bold mx-2 text-lg">{selectedClient?.name}</Text>
                  </View>
                  <FontAwesome name="trash" size={20} className={`mr-3 ${selectedClient ? "block" : "hidden"}`} color="red" onPress={() => clearClient()} />
                </View>
                <TouchableOpacity className="p-2 rounded-md flex-row items-center gap-2 justify-center bg-blue-600" onPress={() => handleAddClient()}>
                  <Text className="font-semibold tracking-wide text-white">{selectedClient ? "Cambiar Cliente" : "Agregar Cliente"}</Text>
                  {selectedClient ? <FontAwesome name="exchange" color="white" size={18} /> : <AntDesign name="plus" color="white" size={18} />}
                </TouchableOpacity>
              </View>

              <Text className="text-2xl font-semibold tracking-wide py-5">Orden:</Text>
              {orderDetails.map((item) => (

                <View key={item.idProducto} style={styles.orderItem}>
                  <View style={styles.orderDetails}>
                    <Text>{item.nombreProducto}</Text>
                    <Text>{`₡${item.precio}`}</Text>
                  </View>
                  <TextInput
                    className="border border-gray-400 px-5 text-center mr-2 h-full rounded-lg"
                    keyboardType="numeric"
                    defaultValue={String(item.cantidad)} //default value para que se pueda editar
                    onChangeText={(text) => {
                      const newQuantity = text === "" ? 0 : parseInt(text, 10);
                      if (!isNaN(newQuantity)) {
                        updateQuantity(item.idProducto, newQuantity);
                      }
                    }}
                    onFocus={() => handleFocus()}
                  />
                  <TouchableOpacity
                    className="bg-red-500 p-3 rounded-md flex-row items-center"
                    onPress={() => removeFromOrder(item.idProducto)}
                  >
                    <Text className="text-white font-bold">Eliminar</Text>
                    <EvilIcons name="trash" size={25} color="white" />
                  </TouchableOpacity>
                </View>


              ))}

              <View className="container my-4">
                <Text className="text-2xl font-bold">Total: ₡{order.totalSinDescuento}</Text>
              </View>
              <View className="mt-5 items-center">
                <TouchableOpacity
                  className="bg-blue-500 p-3 rounded-lg flex-row items-center gap-2"
                  onPress={() => handleSaveOrder()}
                >
                  <Text className="text-white font-bold text-xl">{isActive ? "Editar Orden" : "Guardar Orden"}</Text>
                  <AntDesign name="check" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Text className="text-center text-gray-400 font-bold">Orden sin Productos</Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

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
    borderBottomColor: "#CCC",
  },
  orderDetails: { flexDirection: "column", flex: 2 },
});