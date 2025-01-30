import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import type { ProductGroup } from "@/types/productTypes";
import { Product } from "@/types/productTypes";
import ProductListItem from "./orders/product-list-item";

const CategoryAccordion: React.FC<{
  category: ProductGroup;
  onAddProduct: (product: Product) => void;
}> = ({ category, onAddProduct }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View className="mb-4 bg-gray-50 rounded-lg">
      <TouchableOpacity
        className="p-4 flex-row justify-between items-center"
        onPress={() => setExpanded(!expanded)}
      >
        <Text className="text-lg font-semibold">{category.category}</Text>
        <FontAwesome
          name={expanded ? "chevron-up" : "chevron-down"}
          size={16}
          color="#3b82f6"
        />
      </TouchableOpacity>

      {expanded &&
        category.subCategories.map((subCat: { name: any; products?: Product[]; }) => (
          <SubCategorySection
            key={subCat.name}
            subCategory={{ ...subCat, products: subCat.products || [] }}
            onAddProduct={onAddProduct}
          />
        ))}
    </View>
  );
};

const SubCategorySection: React.FC<{
  subCategory: { name: string; products: Product[] };
  onAddProduct: (product: Product) => void;
}> = ({ subCategory, onAddProduct }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View className="ml-4">
      <TouchableOpacity
        className="p-3 flex-row justify-between items-center"
        onPress={() => setExpanded(!expanded)}
      >
        <Text className="text-base font-medium text-gray-700">
          {subCategory.name}
        </Text>
        <FontAwesome
          name={expanded ? "minus" : "plus"}
          size={14}
          color="#4f46e5"
        />
      </TouchableOpacity>

      {expanded && (
        <View className="ml-2">
          {subCategory.products.map((product) => (
            <ProductListItem
              key={product.id}
              product={product}
              addToOrder={() => onAddProduct(product)}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default React.memo(CategoryAccordion);
