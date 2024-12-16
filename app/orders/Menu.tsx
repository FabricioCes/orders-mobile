import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from "react-native";

import React, { useState, useEffect } from "react";

import { AntDesign, EvilIcons } from "@expo/vector-icons";
import { Product } from "@/types/types";
import { useOrder } from "@/context/OrderContext";



type SubSubCategory = {
  name: string;
  products: Omit<Product, "quantity">[]; // Los productos en el menú no necesitan cantidad
};

type SubCategory = {
  name: string;
  subSubCategories: SubSubCategory[];
};

type Menu = SubCategory[];

export const mockMenu: Menu = [
  {
    name: "Bebidas",
    subSubCategories: [
      {
        name: "Refrescos",
        products: [
          { id: 1, name: "Coca Cola", price: 20 },
          { id: 2, name: "Pepsi", price: 18 },
        ],
      },
      {
        name: "Cafés",
        products: [
          { id: 3, name: "Café Americano", price: 25 },
          { id: 4, name: "Café Latte", price: 30 },
        ],
      },
    ],
  },
  {
    name: "Comidas",
    subSubCategories: [
      {
        name: "Hamburguesas",
        products: [
          { id: 5, name: "Hamburguesa Clásica", price: 50 },
          { id: 6, name: "Hamburguesa Especial", price: 70 },
        ],
      },
    ],
  },
];

export default function Menu() {
  const [expandedSubCategory, setExpandedSubCategory] = useState<string | null>(null);
  const [expandedSubSubCategory, setExpandedSubSubCategory] = useState<string | null>(null);
  const [order, setOrder] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { saveOrder } = useOrder();

  // Normalizar texto (eliminar tildes y convertir a minúsculas)
  const normalizeText = (text: string) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  // Filtrar productos
  const filteredMenu = mockMenu.map((subCategory) => ({
    ...subCategory,
    subSubCategories: subCategory.subSubCategories.map((subSubCategory) => ({
      ...subSubCategory,
      products: subSubCategory.products.filter((product) =>
        normalizeText(product.name).includes(normalizeText(searchQuery))
      ),
    })),
  }));

  // Verificar si hay productos visibles después del filtrado
  const hasProducts =
    filteredMenu.some((subCategory) =>
      subCategory.subSubCategories.some(
        (subSubCategory) => subSubCategory.products.length > 0
      )
    );

  // Desplegar automáticamente las categorías con productos coincidentes
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

  // Agregar producto a la orden
  const addToOrder = (product: Product) => {
    setOrder((prev) => {
      const existingProduct = prev.find((p) => p.id === product.id);
      if (existingProduct) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // Eliminar producto de la orden
  const removeFromOrder = (productId: number) => {
    setOrder((prev) => prev.filter((p) => p.id !== productId));
  };

  // Actualizar cantidad de un producto
  const updateQuantity = (productId: number, quantity: number) => {
    setOrder((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, quantity: Math.max(1, quantity) } : p
      )
    );
  };

  const totalOrder = () => {
    return order.reduce((acc, product) => acc + product.price * product.quantity, 0)
  }

  //Guardar Orden en el Contexto

  const handleSaveOrder = () => {
    saveOrder(order);
  }
  return (
    <View>
      <ScrollView className="container mx-auto p-5" contentContainerStyle={{paddingBottom: 150}}>
        <Text className="font-bold text-2xl">Menú</Text>

        {/* Campo de búsqueda */}
        <TextInput
          className={`border rounded-md p-3 mb-2 ${!hasProducts ? "border-red-400" : "border-gray-400"}`}
          placeholder="Buscar producto..."
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />

        {!hasProducts && (
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
              <Text className="text-xl font-bold text-[#007BFF]">{subCategory.name}</Text>
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
                    <Text className="text-[#0056B3]">
                      {subSubCategory.name}
                    </Text>
                  </TouchableOpacity>

                  {/* Productos */}
                  {expandedSubSubCategory === subSubCategory.name &&
                    subSubCategory.products.map((product) => (
                      <View key={product.id} className="mx-2 flex-row justify-between items-center my-1">
                        <Text className="flex-1">{product.name}</Text>
                        <Text
                          className="mx-4"
                        >{`$${product.price}`}</Text>
                        <TouchableOpacity
                          className="bg-[#007BFF] p-3 rounded-md"
                          onPress={() =>
                            addToOrder({ ...product, quantity: 1 })
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
        {order.length > 0 ? (
          <View className="mt-5 border-t border-t-gray-400 pt-2">
            <Text className="text-2xl font-semibold tracking-wide py-5">
              Orden:
            </Text>
            {order.map((item) => (
              <View key={item.id} style={styles.orderItem}>
                <View style={styles.orderDetails}>
                  <Text>{item.name}</Text>
                  <Text>{`$${item.price}`}</Text>
                </View>
                <TextInput
                  className="border border-gray-400 px-5 text-center mr-2 h-full rounded-lg"
                  keyboardType="numeric"
                  defaultValue={String(item.quantity)}
                  onChangeText={(text) =>
                    updateQuantity(item.id, parseInt(text) || 1)
                  }
                />
                <TouchableOpacity
                  className="bg-red-500 p-3 rounded-md flex-row items-center "
                  onPress={() => removeFromOrder(item.id)}
                >
                  <Text className="text-white font-bold">
                    Eliminar
                  </Text>
                  <EvilIcons name="trash" size={25} color="white" className="mb-1" />
                </TouchableOpacity>

              </View>
            ))}
            <View className="container my-4">
              <Text className="text-2xl font-bold">Total: ${totalOrder()}</Text>
            </View>
            <View className="mt-5 items-center">
              <TouchableOpacity className="bg-blue-500 p-3 rounded-lg flex-row items-center gap-2 "
                onPress={() => handleSaveOrder()}
              >
                <Text className="text-white font-bold text-xl">Guardar Orden</Text>
                <AntDesign name="check" size={20} color="white" />
              </TouchableOpacity>
            </View>

          </View>
        ) : (
          <Text className="text-center text-gray-400 font-bold">
            Orden sin Productos
          </Text>
        )}
      </ScrollView>
      
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
  removeButton: {
    backgroundColor: "#FF4444",
    padding: 10,
    borderRadius: 5,
  },

});