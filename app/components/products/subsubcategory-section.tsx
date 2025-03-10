import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Product } from "@/types/productTypes";

import { useProducts } from "@/core/context/ProductsContext";
import ProductListItem from "./product-list-item";

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
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      if (expanded && localProducts.length === 0) {
        setLoading(true);
        const subscription = loadProductsForSubSubCategory(subSubCategory.nombreSubSubCategoria)
          .subscribe({
            next: (products) => setLocalProducts(products),
            error: (err) => console.log(err),
            complete: () => setLoading(false),
          });
        return () => subscription.unsubscribe();
      }
    }, [expanded, localProducts.length, loadProductsForSubSubCategory, subSubCategory]);

    return (
      <View style={styles.subSubContainer}>
        <TouchableOpacity
          style={styles.subSubHeader}
          onPress={() => setExpanded(!expanded)}
        >
          <Text style={styles.subSubText}>{subSubCategory.nombreSubSubCategoria}</Text>
          <FontAwesome
            name={expanded ? "minus" : "plus"}
            size={12}
            color="#3b82f6"
          />
        </TouchableOpacity>
        {expanded && (
          <View style={styles.productsContainer}>
            {loading ? (
              <ActivityIndicator size="small" color="#3b82f6" />
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

const styles = StyleSheet.create({
  subSubContainer: {
    marginHorizontal: 16,       // márgenes laterales para centrar
    marginVertical: 4,
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    alignSelf: "center",        // centra el contenedor dentro del padre
    width: "90%",               // ancho relativo para mayor control
  },
  subSubHeader: {
    padding: 10,
    flexDirection: "row",
    justifyContent: "center",   // centra el contenido horizontalmente
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  subSubText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
    marginRight: 8,             // separación entre el texto y el ícono
  },
  productsContainer: {
    padding: 8,
    backgroundColor: "#f3f4f6",
    alignItems: "center",       // centra los items de la lista
  },
});

export default SubSubCategorySection;
