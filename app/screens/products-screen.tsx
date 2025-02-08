import React, { useCallback } from "react";
import { View, FlatList } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useProducts } from "@/context/ProductsContext";
import { useOrderManagement } from "@/hooks/useOrderManagement";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import CategoryAccordion from "@/components/CategoryAccordion";
import { Product } from "@/types/productTypes";
import SearchBar from "../components/products/serch-bar";
import Toast from "react-native-toast-message";

const ProductsScreen: React.FC = () => {
  const { orderId, token, userName } = useLocalSearchParams();
  const numericOrderId = Number(orderId);
  const {
    searchQuery,
    setSearchQuery,
    filteredMenu,
    addToOrder,
    error: orderError,
  } = useOrderManagement(numericOrderId, String(userName), String(token), "");

  const { loading: productsLoading, error: productsError } = useProducts();

  if (productsLoading) {
    return <LoadingState message="Cargando productos..." />;
  }

  if (productsError || orderError) {
    return (
      <ErrorState
        message={productsError || orderError || "Error desconocido"}
      />
    );
  }

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
        visibilityTime: 1000
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
        visibilityTime: 1000
      });
    });
  };

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  return (
    <View className="flex-1 bg-white p-4">
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onAddProduct={addToOrder}
        persistSearch={true}
        hasResults={filteredMenu.length > 0}
        placeholder="Buscar productos..."
      />

      <FlatList
        data={filteredMenu}
        keyExtractor={(item) => item.category}
        renderItem={({ item }) => (
          <CategoryAccordion
            category={item}
            onAddProduct={handleAddProduct}
            searchQuery={searchQuery}
          />
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
      <Toast />
    </View>
  );
};

export default React.memo(ProductsScreen);
