import React, { useCallback } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useProducts } from "@/core/context/ProductsContext";
import Toast from "react-native-toast-message";
import CategoriesList from "../components/products/categories-list";
import { Product } from "@/types/productTypes";
import SearchBar from "../components/products/search-bar-products";
import ProductsList from "../components/products/product-list";
import { useOrderOperations } from "@/core/hooks/useOrderOperations";

const ProductScreen: React.FC = () => {
  const { orderId = "0" } = useLocalSearchParams();
  const numericOrderId = Number(orderId);
  const { addProduct } = useOrderOperations(numericOrderId);
  const {
    categories,
    products,
    isLoading,
    error: productsError,
    searchQuery,
    setSearchQuery,
  } = useProducts();

  useFocusEffect(
    useCallback(() => {
      return () => {
        setSearchQuery("");
      };
    }, [setSearchQuery, orderId])
  );

  const handleAddProduct = useCallback(
    (product: Product, quantity: number = 1) => {
      addProduct({
        cantidad: quantity,
        idProducto: product.identificador,
        nombreProducto: product.nombre,
        precioVenta: product.precio,
        idOrden: numericOrderId,
        idOrdenDetalle: 0,
        precioCompra: product.costo,
        impuestoProducto: product.impuesto ?? 0,
      });

      Toast.show({
        type: "success",
        text1: "¡Producto agregado!",
        text2: "Se ha añadido correctamente.",
      });
    },
    [addProduct, orderId]
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, [setSearchQuery]);

  if (productsError) {
    return (
      <View style={styles.centeredView}>
        <Text style={styles.errorText}>{productsError.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClear={handleClearSearch}
        hasResults={products?.length > 0}
        placeholder="Buscar productos..."
      />

      {isLoading ? (
        <View style={styles.centeredView}>
          <ActivityIndicator size="small" color="#4f46e5" />
        </View>
      ) : searchQuery.trim() === "" ? (
        <CategoriesList
          data={categories}
          onAddProduct={handleAddProduct}
          searchQuery={""}
        />
      ) : (
        <ProductsList products={products} onAddProduct={handleAddProduct} />
      )}

      <Toast />
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center" as "center",
    alignItems: "center" as "center",
  },
  errorText: {
    color: "red",
    textAlign: "center" as "center",
  },
};

export default React.memo(ProductScreen);
