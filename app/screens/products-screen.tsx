import React, { useCallback } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useProducts } from "@/core/context/ProductsContext";
import ProductListItem from "@/components/products/product-list-item";
import Toast from "react-native-toast-message";
import CategoriesList from "../components/products/categories-list";
import { Product } from "@/types/productTypes";
import SearchBar from "../components/products/search-bar-products";
import { useOrderOperations } from "@/core/hooks/useOrderOperations";
import { Order } from "@/types/types";

const ProductScreen: React.FC = () => {
  const { order: orderString } = useLocalSearchParams();

  // Parseamos el orderString de manera segura
  let order: Order | undefined;
  try {
    order = orderString ? JSON.parse(String(orderString)) : undefined;
  } catch (error) {
    console.log("Error parsing order from local search params:", error);
  }
  const orderId = order?.numeroOrden ?? 0;
  const { addToOrder } = useOrderOperations(orderId, order);

  const {
    categories,
    flatProducts,
    loading: productsLoading,
    error: productsError,
    searchQuery,
    setSearchQuery,
  } = useProducts();

  // Limpiar el campo de búsqueda al desenfocar la pantalla
  useFocusEffect(
    useCallback(() => {
      return () => {
        setSearchQuery("");
      };
    }, [setSearchQuery])
  );

  const handleAddProduct = useCallback(
    (product: Product, quantity: number = 1) => {
      addToOrder(product, quantity)
        .then(() => {
          Toast.show({
            type: "success",
            text1: "¡Producto agregado!",
            text2: "Se ha añadido correctamente.",
            autoHide: true,
            position: "bottom",
            swipeable: true,
            visibilityTime: 1000,
          });
        })
        .catch((error: Error) => {
          Toast.show({
            type: "error",
            text1: "¡Ups, algo salió mal!",
            text2: `No se pudo agregar el producto: ${error.message}`,
            autoHide: true,
            position: "bottom",
            swipeable: true,
            visibilityTime: 1000,
          });
        });
    },
    [addToOrder]
  );

  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchQuery(text);
    },
    [setSearchQuery]
  );

  if (productsError) {
    return (
      <View
        style={{
          flex: 1,
          padding: 16,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "red", textAlign: "center" }}>
          {productsError || "Error desconocido"}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "white", padding: 16 }}>
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        persistSearch={true}
        hasResults={
          searchQuery.trim() === ""
            ? Boolean(categories?.length)
            : Boolean(flatProducts?.length)
        }
        placeholder="Buscar productos..."
      />

      {searchQuery.trim() === "" ? (
        <CategoriesList
          data={categories}
          onAddProduct={handleAddProduct}
          searchQuery={searchQuery}
        />
      ) : productsLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="small" color="#4f46e5" />
        </View>
      ) : (
        <FlatList
          data={flatProducts}
          keyExtractor={(item, index) => `${item.identificador}-${index}`}
          renderItem={({ item }) => (
            <ProductListItem product={item} onAddProduct={handleAddProduct} />
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          windowSize={5}
          maxToRenderPerBatch={10}
          initialNumToRender={10}
        />
      )}
      <Toast />
    </View>
  );
};

export default React.memo(ProductScreen);
