import { GroupedCategory } from '@/types/productTypes'

export const groupCategories = (data: any[]): GroupedCategory[] => {
  const grouped: Record<
    number,
    {
      identificadorCategoria: number
      nombreCategoria: string
      subCategories: Record<
        number,
        {
          identificadorSubcategoria: number
          nombreSubcategoria: string
          subSubCategories: {
            identificadorSubSubcategoria: number
            nombreSubSubCategoria: string
            products: []
          }[]
        }
      >
    }
  > = data.reduce(
    (acc, curr) => {
      const catId = curr.identificadorCategoria
      // Si no existe la categoría, se crea
      if (!acc[catId]) {
        acc[catId] = {
          identificadorCategoria: curr.identificadorCategoria,
          nombreCategoria: curr.nombreCategoria,
          subCategories: {}
        }
      }
      // Procesamos la subcategoría
      const subcatId = curr.identificadorSubcategoria
      if (!acc[catId].subCategories[subcatId]) {
        acc[catId].subCategories[subcatId] = {
          identificadorSubcategoria: curr.identificadorSubcategoria,
          nombreSubcategoria: curr.nombreSubcategoria,
          subSubCategories: []
        }
      }
      // Agregamos la subsubcategoría
      acc[catId].subCategories[subcatId].subSubCategories.push({
        nombreSubSubCategoria: curr.nombreSubSubCategoria,
        products: []
      })
      return acc
    },
    {} as Record<
      number,
      {
        identificadorCategoria: number
        nombreCategoria: string
        subCategories: Record<
          number,
          {
            identificadorSubcategoria: number
            nombreSubcategoria: string
            subSubCategories: {
              identificadorSubSubcategoria: number
              nombreSubSubCategoria: string
            }[]
          }
        >
      }
    >
  )

  return Object.values(grouped).map(cat => ({
    identificadorCategoria: cat.identificadorCategoria,
    nombreCategoria: cat.nombreCategoria,
    subCategories: Object.values(cat.subCategories).map(subCat => ({
      identificadorSubcategoria: subCat.identificadorSubcategoria,
      nombreSubcategoria: subCat.nombreSubcategoria,
      subSubCategories: subCat.subSubCategories
    }))
  }))
}
