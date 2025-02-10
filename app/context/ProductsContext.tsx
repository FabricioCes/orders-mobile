// src/context/ProductsContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { useSettings } from "./SettingsContext";
import { Product, Category, ProductsContextType } from "@/types/productTypes";
import { productService } from "@/core/services/product.services";
import { Observable } from "rxjs";

const ProductsContext = createContext<ProductsContextType | null>(null);

export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { token, settings } = useSettings();
  const [categories, setCategories] = useState<Category[]>([]);
  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);

  useEffect(() => {
    if (!settings?.idComputadora || !token) return;

    const categoriesSubscription = productService.loadCategories$().subscribe({
      next: (cats) => {
        setCategories(cats);
        setError(null);
      },
      error: (err) => {
        setError(err.message);
      },
    });

    const productsSubscription = productService.products$.subscribe((products) => {
      setRawProducts(products);
    });

    return () => {
      categoriesSubscription.unsubscribe();
      productsSubscription.unsubscribe();
    };
  }, [settings, token]);

  const loadProductsForSubSubCategory = (subSubCategory: string): Observable<Product[]> => {
    if (!settings?.idComputadora || !token) {
      setError("Configuración incompleta");
      throw Error("Configuración incompleta");
    }

    try {
      const products$ = productService.buscarProductosPorSubSubCategoria$(subSubCategory);
      return products$;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      return new Observable<Product[]>();
    }
  };


  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }
    setLoading(true);

    const subscription = productService.searchProducts$(searchQuery).subscribe({
      next: (products) => {
        setSearchResults(products);
        setError(null);
        setLoading(false);
      },
      error: (err) => {
        console.error("Error en la búsqueda:", err);
        setError(err.message);
        setLoading(false);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [searchQuery, settings, token]);

  return (
    <ProductsContext.Provider
      value={{
        categories,
        flatProducts: searchQuery.trim() !== "" ? searchResults : rawProducts,
        loading,
        error,
        searchQuery,
        setSearchQuery,
        loadProductsForSubSubCategory,
        refreshProducts: () => {
          /* Implementar refresco global si es necesario */
        },
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context)
    throw new Error("useProducts must be used within ProductsProvider");
  return context;
};
