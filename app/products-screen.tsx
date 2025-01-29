import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Link, router } from "expo-router";
import SearchBar from "./orders/serch-bar";
import CategoryItem, { SubCategoryItem } from "./orders/category-Item";
import ProductItem from "./orders/product-item";
import { useOrderManagement } from "@/hooks/useOrderManagement";

type Props = {
  tableId: number;
  place: string;
  isActive: boolean;
  orderId: number;
  totalOrder: number;
};
const ProductsScreen: React.FC<Props> = ({
  tableId,
  place,
  isActive,
  orderId,
  totalOrder,
}) => {
  const {
    addToOrder,
    filteredMenu,
    searchQuery,
    setSearchQuery,
    expandedSubCategory,
    setExpandedSubCategory,
    expandedSubSubCategory,
    setExpandedSubSubCategory,
  } = useOrderManagement(isActive, orderId, totalOrder, tableId, place);

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="p-4">
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredMenu={filteredMenu}
        />

        <View className="mt-4">
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
                  {subSubCategory.products.map((product) => (
                    <ProductItem
                      key={product.id}
                      product={product}
                      addToOrder={() => {
                        addToOrder(product);
                        router.back();
                      }}
                    />
                  ))}
                </SubCategoryItem>
              ))}
            </CategoryItem>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default ProductsScreen;
