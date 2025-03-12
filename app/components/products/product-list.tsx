import React from "react";
import { FlatList, StyleSheet } from "react-native";
import { Product } from "@/types/productTypes";
import ProductListItem from "./product-list-item";

interface ProductsListProps {
  products: Product[];
  onAddProduct: (product: Product, quantity: number) => void;
}

const ProductsList: React.FC<ProductsListProps> = ({
  products,
  onAddProduct,
}) => {
  if (!products.length) {
    return null; // SearchBar will handle the no results state
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.identificador.toString()}
      renderItem={({ item }) => (
        <ProductListItem product={item} onAddProduct={onAddProduct} />
      )}
      contentContainerStyle={styles.flatListContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      windowSize={5}
      maxToRenderPerBatch={10}
      initialNumToRender={10}
    />
  );
};

const styles = StyleSheet.create({
  flatListContent: {
    paddingBottom: 20,
  },
});

export default ProductsList;
