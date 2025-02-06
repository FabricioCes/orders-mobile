export type Product = {
  id: number
  name: string
  price: number
  discountPercentage: number
  subCategoryId: number
  subCategory: string
  subSubCategoryId: number
  subSubCategory: string
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
