import React, { useMemo, useState } from "react";
import { View, FlatList } from "react-native";
import { useProducts } from "@/context/ProductsContext";
import { useOrderManagement } from "@/hooks/useOrderManagement";

import CategoryAccordion from "./CategoryAccordion";
import SearchBar from "./orders/serch-bar";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";

const ProductsScreen: React.FC = () => {
  const { groupedProducts, loading, error } = useProducts();
  const [searchQuery, setSearchQuery] = useState("");
  const { addToOrder } = useOrderManagement(true, 1, 100, 1, "Main");

  const filteredGroups = useMemo(() => {
    if (!searchQuery) return groupedProducts;

    const query = searchQuery.toLowerCase();
    return groupedProducts
      .map((group) => ({
        ...group,
        subCategories: group.subCategories.map((subCat) => ({
          ...subCat,
          products: subCat.products.filter(
            (p) =>
              p.name.toLowerCase().includes(query) ||
              p.subCategory.toLowerCase().includes(query)
          ),
        })),
      }))
      .filter((group) =>
        group.subCategories.some((subCat) => subCat.products.length > 0)
      );
  }, [groupedProducts, searchQuery]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <View className="flex-1 bg-white p-4">
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} filteredMenu={filteredGroups} />

      <FlatList
        data={filteredGroups}
        keyExtractor={(item) => item.category}
        renderItem={({ item }) => (
          <CategoryAccordion category={item} onAddProduct={addToOrder} />
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

export default React.memo(ProductsScreen);
