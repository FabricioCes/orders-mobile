export type Product = {
  identificador: number;
  nombre: string;
  costo: number;
  costoDos?: number;
  costoTres?: number;
  costoCuatro?: number;
  precio: number;
  precioDos?: number;
  precioTres?: number;
  precioCuatro?: number;
  impuesto?: number;
  impuestoDos?: number;
  impuestoTres?: number;
  impuestoCuatro?: number;
  porcentajeUtilidad?: number;
  porcentajeUtilidadDos?: number;
  porcentajeUtilidadTres?: number;
  porcentajeUtilidadCuatro?: number;
  identificadorSubCategoria: number;
  subCategoria: string;
  identificadorSubSubCategoria: number;
  subSubCategoria: string;
  unidad?: number;
};
export type Category = {
  identificadorCategoria: number
  nombreCategoria: string
  identificadorSubcategoria: number
  nombreSubcategoria: string
  identificadorSubSubcategoria: number
  nombreSubSubCategoria: string
}

export type ProductGroup = {
  category: string
  subCategories: {
    name: string
    products: Product[]
  }[]
}

export type ProductsContextType = {
  groupedProducts: ProductGroup[]
  loading: boolean
  error: string | null
}
