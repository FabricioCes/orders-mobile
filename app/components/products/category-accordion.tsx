import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { GroupedCategory, Product } from "@/types/productTypes";
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
      <View style={styles.accordionContainer}>
        <TouchableOpacity
          style={styles.accordionHeader}
          onPress={() => setExpanded(!expanded)}
        >
          <Text style={styles.headerText}>{category.nombreCategoria}</Text>
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
              subCategory={{ ...subCat, identificadorSubcategoria: subCat.identificadorSubcategoria.toString() }}
              onAddProduct={onAddProduct}
              searchQuery={searchQuery}
            />
          ))}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  accordionContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  accordionHeader: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomColor: "#e5e7eb",
    borderBottomWidth: 1,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
});

export default CategoryAccordion;
