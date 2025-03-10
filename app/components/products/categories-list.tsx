import React, { useMemo } from "react";
import { FlatList, View, Text, StyleSheet } from "react-native";
import { groupCategories } from "@/utils/groupCategories";
import { GroupedCategory, Product } from "@/types/productTypes";
import CategoryAccordion from "./category-accordion";


interface CategoryListProps {
  data: any[];
  onAddProduct: (product: Product, quantity: number) => void;
  searchQuery: string;
}

const CategoryList: React.FC<CategoryListProps> = ({ data, onAddProduct, searchQuery }) => {
  const groupedData: GroupedCategory[] = useMemo(() => groupCategories(data), [data]);

  if (groupedData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No hay productos disponibles.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={groupedData}
      keyExtractor={(item) => (item.nombreCategoria ?? "unknown").toString()}
      renderItem={({ item }) => (
        <CategoryAccordion
          category={item}
          onAddProduct={onAddProduct}
          searchQuery={searchQuery}
        />
      )}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    padding: 16,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});

export default CategoryList;
