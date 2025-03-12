import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Product } from "@/types/productTypes";
import ProductListItem from "./product-list-item";
import { useProducts } from "@/core/context/ProductsContext";

interface SubSubCategorySectionProps {
  subSubCategory: { nombreSubSubCategoria: string };
  onAddProduct: (product: Product, quantity: number) => void;
  searchQuery: string;
}

const SubSubCategorySection: React.FC<SubSubCategorySectionProps> = React.memo(
  ({ subSubCategory, onAddProduct, searchQuery }) => {
    const [expanded, setExpanded] = useState<boolean>(!!searchQuery.trim());

    // Usar el hook para obtener productos de la sub-subcategoría, 
    // la consulta se ejecuta solo cuando está expandida
    const { products, isLoading, error } = useProducts(
      "",
      subSubCategory.nombreSubSubCategoria,
    );

    return (
      <View style={styles.subSubContainer}>
        <TouchableOpacity
          style={styles.subSubHeader}
          onPress={() => setExpanded((prev) => !prev)}
        >
          <Text style={styles.subSubText}>
            {subSubCategory.nombreSubSubCategoria}
          </Text>
          <FontAwesome
            name={expanded ? "minus" : "plus"}
            size={12}
            color="#3b82f6"
          />
        </TouchableOpacity>
        {expanded && (
          <View style={styles.productsContainer}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#3b82f6" />
            ) : error ? (
              <Text style={{ color: "red" }}>
                Error al cargar productos
              </Text>
            ) : (
              products.map((product) => (
                <ProductListItem
                  key={product.identificador.toString()}
                  product={product}
                  onAddProduct={onAddProduct}
                />
              ))
            )}
          </View>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  subSubContainer: {
    marginHorizontal: 16,
    marginVertical: 4,
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    alignSelf: "center",
    width: "90%",
  },
  subSubHeader: {
    padding: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  subSubText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
    marginRight: 8,
  },
  productsContainer: {
    padding: 8,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
  },
});

export default SubSubCategorySection;
