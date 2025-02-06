// src/components/orders/SearchBar.tsx
import React from 'react';
import { TextInput, View, StyleSheet } from 'react-native';
import ErrorState from '../ErrorState';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
  hasResults?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  placeholder = 'Buscar producto...',
  hasResults = true
}) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        value={searchQuery}
        onChangeText={onSearchChange}
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
      />

      {/* Mostrar mensaje de error si no hay resultados */}
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