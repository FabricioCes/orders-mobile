import { createContext, useContext, useEffect, useState } from "react";
import { useSettings } from "./SettingsContext";
import { Text } from "react-native";

interface ProductsContextType {
    orderedProducts: OrderedProduct[];
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

type Product = {
    identificador: number; // Cambia a number
    nombre: string;
    precio: number;
    idSubCategoria: number;
    subCategoria: string;
    idSubSubCategoria: number;
    subSubCategoria: string;
  };
  
  type OrderedProduct = {
    name: string;
    subSubCategories: {
      name: string;
      products: {
        id: number;
        name: string;
        price: number;
      }[];
    }[];
  };

export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token, settings } = useSettings();
    const [products, setProducts] = useState<Product[]>([]);
    const [orderedProducts, setOrderedProducts] = useState<OrderedProduct[]>([]);

    const getProducts = async (page: string, size: string) => {
        try {
            const response = await fetch(`http://${settings}:5001/producto?pagina=${page}&tamanoPagina=${size}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });
            const data = await response.json();
            setProducts(data.resultado || []); // Asegurarse de no setear 'null'
        } catch (error) {
            //console.error("Error al obtener productos:", error);
            setProducts([]); // Fallback a array vacío en caso de error
        }
    };

    const orderProducts = (products: Product[]) => {
        const ordered = products.reduce((acc: OrderedProduct[], product: Product) => {
          let subCategory = acc.find((cat) => cat.name === product.subCategoria);
      
          if (!subCategory) {
            subCategory = {
              name: product.subCategoria,
              subSubCategories: [],
            };
            acc.push(subCategory);
          }
      
          let subSubCategory = subCategory.subSubCategories.find(
            (sub) => sub.name === product.subSubCategoria
          );
      
          if (!subSubCategory) {
            subSubCategory = {
              name: product.subSubCategoria,
              products: [],
            };
            subCategory.subSubCategories.push(subSubCategory);
          }
      
          subSubCategory.products.push({
            id: Number(product.identificador), // Convierte explícitamente a número
            name: product.nombre,
            price: product.precio,
          });
      
          return acc;
        }, []);
      
        setOrderedProducts(ordered);
      };

    useEffect(() => {
        getProducts("1", "50");
    }, [token]);

    useEffect(() => {
        if (products.length > 0) {
            orderProducts(products);
        }
    }, [products]);

    return (
        <ProductsContext.Provider value={{ orderedProducts }}>
            {children}
        </ProductsContext.Provider>
    );
};

export const useProducts = (): ProductsContextType => {
    const context = useContext(ProductsContext);
    if (!context) {
        throw new Error("useProducts debe usarse dentro de un ProductsProvider");
    }
    return context;
};