// src/components/orders/SearchBar.tsx
import React, { useEffect, useState } from 'react';
import { TextInput, View, StyleSheet } from 'react-native';
import { Product } from '@/types/productTypes';
import ErrorState from '../ErrorState';


interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddProduct?: (product: Product) => void;
  placeholder?: string;
  hasResults?: boolean;
  persistSearch?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  placeholder = 'Buscar producto...',
  hasResults = true,
  persistSearch = false,
  onAddProduct
}) => {
  const [localQuery, setLocalQuery] = useState(searchQuery);

  // Sincronizar con el estado externo
  useEffect(() => {
    if (!persistSearch) {
      setLocalQuery(searchQuery);
    }
  }, [searchQuery]);

  const handleChange = (text: string) => {
    setLocalQuery(text);
    onSearchChange(text);
  };

  const handleSubmit = () => {
    if (onAddProduct) {
      const dummyProduct: Product = {
        identificador: 0,
        nombre: localQuery,
        precio: 0,
        costo: 0,
        identificadorSubCategoria: 0,
        subCategoria: '',
        identificadorSubSubCategoria: 0,
        subSubCategoria: ''
      };
      onAddProduct(dummyProduct);
      if (!persistSearch) setLocalQuery('');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        value={persistSearch ? searchQuery : localQuery}
        onChangeText={handleChange}
        onSubmitEditing={handleSubmit}
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
        returnKeyType={onAddProduct ? 'done' : 'search'}
      />

      {!hasResults && searchQuery && (
        <View style={styles.errorContainer}>
          <ErrorState message="No se encontraron productos" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  searchInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#c7d2fe',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    color: '#1e293b',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  errorContainer: {
    marginTop: 8,
  },
});

export default React.memo(SearchBar);