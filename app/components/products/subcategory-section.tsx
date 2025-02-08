import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Product } from "@/types/productTypes";
import SubSubCategorySection from "./subsubcategory-section";

interface SubCategorySectionProps {
  subCategory: {
    nombreSubcategoria: string;
    subSubCategories: { nombreSubSubCategoria: string; products: Product[] }[];
  };
  onAddProduct: (product: Product, quantity: number) => void;
  searchQuery: string;
}

const SubCategorySection: React.FC<SubCategorySectionProps> = React.memo(
  ({ subCategory, onAddProduct, searchQuery }) => {
    const [expanded, setExpanded] = useState<boolean>(!!searchQuery.trim());

    useEffect(() => {
      if (searchQuery.trim()) {
        setExpanded(true);
      }
    }, [searchQuery]);

    return (
      <View style={{ marginLeft: 16 }}>
        <TouchableOpacity
          style={{
            padding: 12,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
          onPress={() => setExpanded(!expanded)}
        >
          <Text style={{ fontSize: 16, fontWeight: "500", color: "#4b5563" }}>
            {subCategory.nombreSubcategoria}
          </Text>
          <FontAwesome
            name={expanded ? "minus" : "plus"}
            size={14}
            color="#4f46e5"
          />
        </TouchableOpacity>
        {expanded &&
          subCategory.subSubCategories.map((subSubCat) => (
            <SubSubCategorySection
              key={subSubCat.nombreSubSubCategoria}
              subSubCategory={subSubCat}
              onAddProduct={onAddProduct}
              searchQuery={searchQuery}
            />
          ))}
      </View>
    );
  }
);

export default SubCategorySection;