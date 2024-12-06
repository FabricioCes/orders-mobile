import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from "react-native";
import React, { useState, useEffect } from "react";
import { AntDesign, EvilIcons, FontAwesome5 } from "@expo/vector-icons";

type Product = {
  id: number;
  name: string;
  price: number;
  quantity: number; // Nueva propiedad para la cantidad
};

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
  const [expandedSubCategory, setExpandedSubCategory] = useState<string | null>(
    null
  );
  const [expandedSubSubCategory, setExpandedSubSubCategory] =
    useState<string | null>(null);
  const [order, setOrder] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

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

  return (
    <ScrollView className="container mx-auto p-5">
      <Text className="font-bold text-2xl">Menú</Text>

      {/* Campo de búsqueda */}
      <TextInput
        style={styles.searchInput}
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
            <Text style={styles.subCategoryTitle}>{subCategory.name}</Text>
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
                  <Text style={styles.subSubCategoryTitle}>
                    {subSubCategory.name}
                  </Text>
                </TouchableOpacity>

                {/* Productos */}
                {expandedSubSubCategory === subSubCategory.name &&
                  subSubCategory.products.map((product) => (
                    <View key={product.id} style={styles.product} className="mx-2">
                      <Text style={styles.productName}>{product.name}</Text>
                      <Text
                        style={styles.productPrice}
                      >{`$${product.price}`}</Text>
                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={() =>
                          addToOrder({ ...product, quantity: 1 })
                        }
                      >
                        <Text style={styles.addButtonText}>Agregar</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
              </View>
            ))}
        </View>
      ))}

      {/* Orden */}
      {order.length > 0 ? (
        <View style={styles.order}>
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
                style={styles.removeButton}
                onPress={() => removeFromOrder(item.id)}
              >
                <Text style={styles.removeButtonText}>Eliminar <EvilIcons name="trash" size={20} color="white"/></Text>
              </TouchableOpacity>

             
            </View>
          ))}
           <View className="mt-5 items-center">
                <TouchableOpacity className="bg-blue-500 p-3 rounded-lg">
                  <Text className="text-white font-bold text-xl">Guardar Orden <AntDesign name="check" size={20} color="white" /></Text>
                 
                </TouchableOpacity>
              </View>
        </View>
      ) : (
        <Text className="text-center text-gray-400 font-bold">
          Orden sin Productos
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  searchInput: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  subCategoryTitle: { fontSize: 18, fontWeight: "bold", color: "#007BFF" },
  subSubCategoryTitle: { fontSize: 16, color: "#0056B3" },
  product: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 5,
  },
  productName: { fontSize: 16, flex: 1 },
  productPrice: { fontSize: 16, marginHorizontal: 10 },
  addButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  addButtonText: { color: "#FFF", fontWeight: "bold" },
  order: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#CCC",
    paddingTop: 10,
  },
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
  removeButtonText: { color: "#FFF", fontWeight: "bold" },
});