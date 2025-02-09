import React, { useState, useEffect } from "react";
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
    const { loadProductsForSubSubCategory } = useProducts();
    const [expanded, setExpanded] = useState<boolean>(!!searchQuery.trim());
    const [localProducts, setLocalProducts] = useState<Product[]>([]);
    const [loading, setloading] = useState(false);

    useEffect(() => {
      if (expanded && localProducts.length === 0) {
        setloading(true);
        const subscription = loadProductsForSubSubCategory(subSubCategory.nombreSubSubCategoria)
          .subscribe({
            next: (products) => setLocalProducts(products),
            error: (err) => console.error(err),
            complete:()=> setloading(false)
          });
        return () => subscription.unsubscribe();
      }
    }, [expanded, localProducts.length, loadProductsForSubSubCategory, subSubCategory]);

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
              localProducts.map((product) => (
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
