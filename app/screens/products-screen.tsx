// src/screens/ProductsScreen.tsx
import React from 'react';
import { View, FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useProducts } from '@/context/ProductsContext';
import { useOrderManagement } from '@/hooks/useOrderManagement';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import CategoryAccordion from '@/components/CategoryAccordion';
import { Product } from '@/types/productTypes';
import SearchBar from '../components/orders/serch-bar';

const ProductsScreen: React.FC = () => {
  const { orderId } = useLocalSearchParams();
  const numericOrderId = Number(orderId);

  // Estados y métodos del hook de gestión de órdenes
  const {
    searchQuery,
    setSearchQuery,
    filteredMenu,
    addToOrder,
    loading: orderLoading,
    error: orderError
  } = useOrderManagement(numericOrderId);

  // Estados del contexto de productos
  const {
    loading: productsLoading,
    error: productsError
  } = useProducts();

  // Manejo de estados de carga y errores
  if (productsLoading || !orderLoading) {
    return <LoadingState message="Cargando productos..." />;
  }

  if (productsError || orderError) {
    return <ErrorState message={productsError || orderError || 'Error desconocido'} />;
  }

  const handleAddProduct = (product: Product, quantity: number = 1) => {
    addToOrder(product, quantity)
      .then(() => {
      // Aquí podrías mostrar una notificación de éxito si lo deseas
      })
      .catch((error: Error) => {
      console.error('Error al agregar producto:', error);
      // Aquí podrías mostrar una notificación de error
      });
  };

  return (
    <View className="flex-1 bg-white p-4">
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Buscar productos..."
      />

      <FlatList
        data={filteredMenu}
        keyExtractor={(item) => item.category}
        renderItem={({ item }) => (
          <CategoryAccordion
            category={item}
            onAddProduct={handleAddProduct}
            searchQuery={searchQuery}
          />
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
};

export default React.memo(ProductsScreen);