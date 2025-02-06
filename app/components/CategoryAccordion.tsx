import React, { useState, useMemo, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import type { ProductGroup, Product } from "@/types/productTypes";
import ProductListItem from "./orders/product-list-item";

interface CategoryAccordionProps {
  category: ProductGroup;
  onAddProduct: (product: Product, quantity: number) => void;
  searchQuery: string;
}

const CategoryAccordion: React.FC<CategoryAccordionProps> = ({
  category,
  onAddProduct,
  searchQuery,
}) => {
  const [expanded, setExpanded] = useState<boolean>(!!searchQuery.trim());

  // Cuando se realiza una búsqueda se expande la categoría automáticamente
  useEffect(() => {
    if (searchQuery.trim()) {
      setExpanded(true);
    } else {
      setExpanded(false);
    }
  }, [searchQuery]);

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
        category.subCategories.map((subCat) => (
          <SubCategorySection
            key={subCat.name}
            subCategory={{ ...subCat, products: subCat.products || [] }}
            onAddProduct={onAddProduct}
            searchQuery={searchQuery}
          />
        ))}
    </View>
  );
};

interface SubCategorySectionProps {
  subCategory: { name: string; products: Product[] };
  onAddProduct: (product: Product, quantity: number) => void;
  searchQuery: string;
}

const SubCategorySection: React.FC<SubCategorySectionProps> = ({
  subCategory,
  onAddProduct,
  searchQuery,
}) => {
  const [expanded, setExpanded] = useState<boolean>(!!searchQuery.trim());

  // Cuando se realiza una búsqueda se expande la subcategoría automáticamente
  useEffect(() => {
    if (searchQuery.trim()) {
      setExpanded(true);
    }
  }, [searchQuery]);

  // Filtramos los productos de la subcategoría según el searchQuery
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return subCategory.products;
    return subCategory.products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [subCategory.products, searchQuery]);

  // Si no hay productos que coincidan con el search, se omite la subcategoría
  if (!filteredProducts.length && searchQuery.trim()) {
    return null;
  }

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
          {filteredProducts.map((product) => (
            <ProductListItem
              key={product.id}
              product={product}
              onAddProduct={onAddProduct}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default CategoryAccordion;
