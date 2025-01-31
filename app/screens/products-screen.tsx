import React from "react";
import { View, FlatList } from "react-native";
import { useProducts } from "@/context/ProductsContext";
import { useOrderManagement } from "@/hooks/useOrderManagement";
import { useLocalSearchParams } from "expo-router";

import CategoryAccordion from "../components/CategoryAccordion";
import SearchBar from "../components/orders/serch-bar";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

const ProductsScreen: React.FC = () => {
  const { tableId, place, isActive, orderId } = useLocalSearchParams();

  const {
    searchQuery,
    setSearchQuery,
    filteredMenu,
    addToOrder
  } = useOrderManagement(
    isActive === "true",
    Number(orderId),
    Number(tableId),
    String(place)
  );

  const { loading, error } = useProducts();

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <View className="flex-1 bg-white p-4">
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredMenu={filteredMenu}
      />

      <FlatList
        data={filteredMenu}
        keyExtractor={(item) => item.category}
        renderItem={({ item }) => (
          <CategoryAccordion
            category={item}
            onAddProduct={addToOrder}
          />
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default React.memo(ProductsScreen);