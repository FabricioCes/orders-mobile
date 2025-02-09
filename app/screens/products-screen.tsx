// src/screens/ProductScreen.tsx
import React, { useCallback } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useProducts } from "@/context/ProductsContext";
import { useOrderManagement } from "@/hooks/useOrderManagement";
import ProductListItem from "@/components/products/product-list-item";
import Toast from "react-native-toast-message";
import CategoriesList from "../components/products/categories-list";
import { Product } from "@/types/productTypes";
import SearchBar from "../components/products/search-bar-products";

const ProductScreen: React.FC = () => {
  const { orderId, token, userName } = useLocalSearchParams();
  const numericOrderId = Number(orderId);

  const { addToOrder, error: orderError } = useOrderManagement(
    numericOrderId,
    String(userName),
    String(token),
    ""
  );

  const {
    categories,
    flatProducts,
    loading: productsLoading,
    error: productsError,
    searchQuery,
    setSearchQuery,
  } = useProducts();

  const handleAddProduct = (product: Product, quantity: number = 1) => {
    addToOrder(product, quantity)
      .then(() => {
        Toast.show({
          type: "success",
          text1: "¡Producto agregado!",
          text2: "Se ha añadido correctamente. 🛒",
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
          text2: "No se pudo agregar el producto. 😞",
          autoHide: true,
          position: "bottom",
          swipeable: true,
          visibilityTime: 1000,
        });
      });
  };

  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchQuery(text);
    },
    [setSearchQuery]
  );

  if (productsError || orderError) {
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ color: "red" }}>
          {productsError || orderError || "Error desconocido"}
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
        />
      )}
      <Toast />
    </View>
  );
};

export default React.memo(ProductScreen);
