import React from "react";
import { FlatList, StyleSheet, View } from "react-native";

import { Product } from "@/types/productTypes";
import ProductListItem from "./product-list-item";

interface ProductsListProps {
  flatProducts: Product[];
  handleAddProduct: (product: Product, quantity: number) => void;
}

const ProductsList: React.FC<ProductsListProps> = ({ flatProducts, handleAddProduct }) => {
  return (
      <FlatList
        data={flatProducts}
        keyExtractor={(item, index) => `${item.identificador}-${index}`}
        renderItem={({ item }) => (
          <ProductListItem product={item} onAddProduct={handleAddProduct} />
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
