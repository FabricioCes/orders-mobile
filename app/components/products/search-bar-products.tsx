// SearchBar.tsx
import React, { useEffect, useState } from "react";
import { TextInput, View, StyleSheet } from "react-native";
import ErrorState from "../ErrorState";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
  hasResults?: boolean;
  persistSearch?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  placeholder = "Buscar producto...",
  hasResults = true,
  persistSearch = false,
}) => {
  const [localQuery, setLocalQuery] = useState(searchQuery);

  useEffect(() => {
    if (!persistSearch) {
      setLocalQuery(searchQuery);
    }
  }, [searchQuery, persistSearch]);

  const handleChange = (text: string) => {
    setLocalQuery(text);
    onSearchChange(text);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        value={persistSearch ? searchQuery : localQuery}
        onChangeText={handleChange}
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
        returnKeyType="search"
      />
      {!hasResults && searchQuery ? (
        <View style={styles.errorContainer}>
          <ErrorState message="No se encontraron productos" />
        </View>
      ) : null}
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
    borderColor: "#c7d2fe",
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    color: "#1e293b",
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  errorContainer: {
    marginTop: 8,
  },
});

export default SearchBar;
