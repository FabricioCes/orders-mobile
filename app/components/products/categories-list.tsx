// CategoryList.tsx
import React, { useMemo } from "react";
import { FlatList, View, Text } from "react-native";

import { groupCategories } from "@/utils/groupCategories";
import { Product, GroupedCategory } from "@/types/productTypes";
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
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 16, color: "#6b7280" }}>No hay productos disponibles.</Text>
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
      contentContainerStyle={{ padding: 16 }}
    />
  );
};

export default CategoryList;
