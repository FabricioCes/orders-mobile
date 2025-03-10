import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Product } from "@/types/productTypes";
import SubSubCategorySection from "./subsubcategory-section";


interface SubCategorySectionProps {
  subCategory: {
    nombreSubcategoria: string;
    subSubCategories: { nombreSubSubCategoria: string; products: Product[] }[];
    identificadorSubcategoria?: string;
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
      <View style={styles.subCategoryContainer}>
        <TouchableOpacity
          style={styles.subCategoryHeader}
          onPress={() => setExpanded(!expanded)}
        >
          <Text style={styles.subCategoryText}>{subCategory.nombreSubcategoria}</Text>
          <FontAwesome
            name={expanded ? "minus" : "plus"}
            size={14}
            color="#3b82f6"
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

const styles = StyleSheet.create({
  subCategoryContainer: {
    marginLeft: 16,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    marginHorizontal: 12,
    marginVertical: 8,
    overflow: "hidden",
  },
  subCategoryHeader: {
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#e5e7eb",
  },
  subCategoryText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
  },
});

export default SubCategorySection;
