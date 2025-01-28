import React, { useState, useRef } from "react";
import {
  View,
  ScrollView,
  Text,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useClients } from "@/context/ClientsContext";
import SearchBar from "./SerchBar";
import ProductItem from "./ProductItem";
import OrderSummary from "./OrderSummary";
import CategoryItem, { SubCategoryItem } from "./CategoryItem";
import { router } from "expo-router";
import { useOrderManagement } from "@/hooks/useOrderManagement";

type Props = {
  tableId: number;
  place: string;
  isActive: boolean;
  orderId: number;
  totalOrder: number;
};

const Menu: React.FC<Props> = ({
  tableId,
  place,
  isActive,
  orderId,
  totalOrder,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  const {
    filteredMenu,
    searchQuery,
    setSearchQuery,
    addToOrder,
    expandedSubCategory,
    setExpandedSubCategory,
    expandedSubSubCategory,
    setExpandedSubSubCategory
  } = useOrderManagement(isActive, orderId, totalOrder, tableId, place);

  return (
    <View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="container mx-auto p-5"
          contentContainerStyle={{ paddingBottom: 160 }}
          keyboardShouldPersistTaps="handled"
          ref={scrollViewRef}
        >
          <Text className="font-bold text-2xl">Menú</Text>

          {/* SearchBar */}
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredMenu={filteredMenu}
          />

          {filteredMenu.map((subCategory) => (
            <CategoryItem
              key={subCategory.name}
              categoryName={subCategory.name}
              expandedCategory={expandedSubCategory}
              toggleCategory={() =>
                setExpandedSubCategory((prev) =>
                  prev === subCategory.name ? null : subCategory.name
                )
              }
            >
              {/* SubCategorías */}
              {subCategory.subSubCategories.map((subSubCategory) => (
                <SubCategoryItem
                  key={subSubCategory.name}
                  subCategoryName={subSubCategory.name}
                  expandedSubCategory={expandedSubSubCategory}
                  toggleSubCategory={() =>
                    setExpandedSubSubCategory((prev) =>
                      prev === subSubCategory.name ? null : subSubCategory.name
                    )
                  }
                >
                  {/* Productos */}
                  {subSubCategory.products.map((product) => (
                    <ProductItem
                      key={product.id}
                      product={product}
                      addToOrder={() => addToOrder(product)}
                    />
                  ))}
                </SubCategoryItem>
              ))}
            </CategoryItem>
          ))}


        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Menu;
