import { useQuery } from "@tanstack/react-query";
import { Product, Category } from "@/types/productTypes";
import { productService } from "@/core/services/product.services";
import { firstValueFrom } from "rxjs";
import { useSettings } from "@/core/context/SettingsContext";
import { useState } from "react";

export const useCategories = () => {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => firstValueFrom(productService.loadCategories$()),
    staleTime: Infinity,
  });
};

export const useProducts = (
  initialSearchQuery: string = "",
  subSubCategory?: string,
  enabled: boolean = true
) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const { data: categories } = useCategories();
  const { settings, token } = useSettings();

  const {
    data: products,
    isLoading,
    error,
  } = useQuery<Product[]>({
    queryKey: ["products", searchQuery, subSubCategory],
    queryFn: async () => {
      // Validar configuración
      if (!settings?.idComputadora || !token) {
        throw new Error("Configuración incompleta");
      }

      // Si hay un término de búsqueda, se usan los productos filtrados
      if (searchQuery.trim()) {
        console.log("Searching for:", searchQuery);
        const result = await firstValueFrom(
          productService.searchProducts$(searchQuery)
        );
        return result || [];
      }
      // Si se pasa una subSubCategory (y no hay búsqueda), se cargan los productos de esa categoría
      else if (subSubCategory) {
        try {
          const result = await firstValueFrom(
            productService.searchProductByCategory$(subSubCategory)
          );
          return result || [];
        } catch (err) {
          throw new Error(
            err instanceof Error ? err.message : "Error desconocido"
          );
        }
      }
      // En otro caso, se cargan todos los productos
      else {
        const result = await firstValueFrom(productService.products$);
        return result || [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled,
  });

  return {
    categories: categories || [],
    products: products || [],
    isLoading,
    error,
    searchQuery,
    setSearchQuery, // Now this is a proper state setter
  };
};
