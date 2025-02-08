import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Product, GroupedCategory } from "@/types/productTypes";
import SubCategorySection from "./subcategory-section";

interface CategoryAccordionProps {
  category: GroupedCategory;
  onAddProduct: (product: Product, quantity: number) => void;
  searchQuery: string;
}

const CategoryAccordion: React.FC<CategoryAccordionProps> = React.memo(
  ({ category, onAddProduct, searchQuery }) => {
    const [expanded, setExpanded] = useState<boolean>(!!searchQuery.trim());

    useEffect(() => {
      setExpanded(!!searchQuery.trim());
    }, [searchQuery]);

    return (
      <View
        style={{
          marginBottom: 16,
          backgroundColor: "#f9fafb",
          borderRadius: 8,
        }}
      >
        <TouchableOpacity
          style={{
            padding: 16,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
          onPress={() => setExpanded(!expanded)}
        >
          <Text style={{ fontSize: 18, fontWeight: "600" }}>
            {category.nombreCategoria}
          </Text>
          <FontAwesome
            name={expanded ? "chevron-up" : "chevron-down"}
            size={16}
            color="#3b82f6"
          />
        </TouchableOpacity>
        {expanded &&
          category.subCategories.map((subCat) => (
            <SubCategorySection
              key={subCat.identificadorSubcategoria}
              subCategory={subCat}
              onAddProduct={onAddProduct}
              searchQuery={searchQuery}
            />
          ))}
      </View>
    );
  }
);

export default CategoryAccordion;
