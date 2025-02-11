import { BehaviorSubject, Observable, from } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Category, Product } from '@/types/productTypes';
import { ProductApiRepository } from '../repositories/produt.repository';

class ProductService {
  private productsSubject = new BehaviorSubject<Product[]>([]);
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  private searchResultsSubject = new BehaviorSubject<Product[]>([]);

  products$ = this.productsSubject.asObservable();
  categories$ = this.categoriesSubject.asObservable();
  searchResults$ = this.searchResultsSubject.asObservable();

  loadCategories$(): Observable<Category[]> {
    return from(ProductApiRepository.getCategories()).pipe(
      tap({
        next: categories => this.categoriesSubject.next(categories),
        error: err => console.error('Error al cargar categorías:', err)
      })
    );
  }

  loadProductsByCategory$(categoryId: number): Observable<Product[]> {
    return from(ProductApiRepository.getProductsByCategory(categoryId)).pipe(
      tap({
        next: products => this.productsSubject.next(products),
        error: err => console.error('Error al cargar productos:', err)
      })
    );
  }

  searchProducts$(query: string): Observable<Product[]> {
    return from(ProductApiRepository.searchProducts(query)).pipe(
      tap({
        next: results => this.searchResultsSubject.next(results),
        error: err => console.error('Error en la búsqueda de productos:', err)
      })
    );
  }

  buscarProductosPorSubSubCategoria$(subSubCategory: string): Observable<Product[]> {
    return from(ProductApiRepository.getProductsBySubSubCategory(subSubCategory)).pipe(
      tap({
        error: err => console.error('Error al cargar productos por subsubcategoría:', err)
      })
    );
  }
}

export const productService = new ProductService();
