import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSettings } from "./SettingsContext";
import { Product, ProductGroup, ProductsContextType } from "@/types/productTypes";

const ProductsContext = createContext<ProductsContextType | null>(null);

export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { token, settings } = useSettings();
  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const groupedProducts = useMemo(() => {
    const groupsMap = rawProducts.reduce(
      (acc: Record<string, ProductGroup>, product) => {
        const { subCategoria, subSubCategoria } = product;

        if (!acc[subCategoria]) {
          acc[subCategoria] = {
            category: subCategoria,
            subCategories: [],
          };
        }

        const subCatGroup = acc[subCategoria].subCategories.find(
          (s: { name: string; }) => s.name === subSubCategoria
        );
        if (!subCatGroup) {
          acc[subCategoria].subCategories.push({
            name: subSubCategoria,
            products: [product],
          });
        } else {
          subCatGroup.products.push(product);
        }

        return acc;
      },
      {}
    );

    return Object.values(groupsMap);
  }, [rawProducts]);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchProducts = async () => {
      try {
        if (!settings?.idComputadora || !token) {
          throw new Error("Configuración incompleta");
        }

        const response = await fetch(
          `http://${settings.idComputadora}:5001/producto?pagina=1&tamanoPagina=1000`,
          {
            signal: abortController.signal,
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) throw new Error("Error en la respuesta");

        const data = await response.json();
        const products = data.resultado?.map(transformApiProduct) || [];
        setRawProducts(products);
        setError(null);
      } catch (err) {
        if (!abortController.signal.aborted) {
          setError(err instanceof Error ? err.message : "Error desconocido");
          setRawProducts([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    return () => abortController.abort();
  }, [token, settings]);

  return (
    <ProductsContext.Provider value={{ groupedProducts, loading, error }}>
      {children}
    </ProductsContext.Provider>
  );
};

const transformApiProduct = (apiProduct: any): Product => ({
  identificador: Number(apiProduct.identificador),
  nombre: apiProduct.nombre,
  precio: Number(apiProduct.precio),
  identificadorSubCategoria: Number(apiProduct.idSubCategoria),
  subCategoria: apiProduct.subCategoria,
  identificadorSubSubCategoria: Number(apiProduct.idSubSubCategoria),
  subSubCategoria: apiProduct.subSubCategoria,
  costo: apiProduct.costo
});

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context)
    throw new Error("useProducts must be used within ProductsProvider");
  return context;
};
