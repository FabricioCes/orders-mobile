import React, { useState, useEffect, useMemo } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Product } from "@/types/productTypes";
import ProductListItem from "./product-list-item";
import { useProducts } from "@/context/ProductsContext";

interface SubSubCategorySectionProps {
  subSubCategory: { nombreSubSubCategoria: string };
  onAddProduct: (product: Product, quantity: number) => void;
  searchQuery: string;
}

const SubSubCategorySection: React.FC<SubSubCategorySectionProps> = React.memo(
  ({ subSubCategory, onAddProduct, searchQuery }) => {
    const { loadProductsForSubSubCategory, flatProducts, loading } = useProducts();
    const [expanded, setExpanded] = useState<boolean>(!!searchQuery.trim());

    // Filtrar productos en el contexto que pertenecen a esta subsubcategoría
    const products = useMemo(() => {
      return flatProducts.filter(
        (product) => product.subSubCategoria === subSubCategory.nombreSubSubCategoria
      );
    }, [flatProducts, subSubCategory]);

    useEffect(() => {
      if (searchQuery.trim()) {
        setExpanded(true);
      }
    }, [searchQuery]);

    useEffect(() => {
      if (expanded && products.length === 0) {
        loadProductsForSubSubCategory(subSubCategory.nombreSubSubCategoria);
      }
    }, [expanded, products.length]);

    const filteredProducts = useMemo(() => {
      if (!searchQuery.trim()) return products;
      return products.filter((product) =>
        product.nombre.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }, [products, searchQuery]);

    if (searchQuery.trim() && filteredProducts.length === 0) {
      return null;
    }

    return (
      <View style={{ marginLeft: 24 }}>
        <TouchableOpacity
          style={{
            padding: 12,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
          onPress={() => setExpanded(!expanded)}
        >
          <Text style={{ fontSize: 14, fontWeight: "500", color: "#4b5563" }}>
            {subSubCategory.nombreSubSubCategoria}
          </Text>
          <FontAwesome
            name={expanded ? "minus" : "plus"}
            size={12}
            color="#4f46e5"
          />
        </TouchableOpacity>
        {expanded && (
          <View style={{ marginLeft: 8 }}>
            {loading ? (
              <ActivityIndicator size="small" color="#4f46e5" />
            ) : (
              filteredProducts.map((product) => (
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

export default SubSubCategorySection;
