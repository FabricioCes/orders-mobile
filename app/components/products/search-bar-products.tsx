import React, { useEffect, useState } from "react";
import { TextInput, View, StyleSheet, TouchableOpacity } from "react-native";
import ErrorState from "../ErrorState";
import { FontAwesome } from "@expo/vector-icons";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClear: () => void;
  placeholder?: string;
  hasResults: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onClear,
  placeholder = "Buscar producto...",
  hasResults,
}) => {
  const [localQuery, setLocalQuery] = useState(searchQuery);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  const handleTextChange = (text: string) => {
    setLocalQuery(text);
    onSearchChange(text);
  };

  const handleClear = () => {
    setLocalQuery("");
    onClear();
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          value={localQuery}
          onChangeText={handleTextChange}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {localQuery.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <FontAwesome
              name='minus-circle'
              size={20}
              color="#94a3b8"
            />
          </TouchableOpacity>
        )}
      </View>
      {!hasResults && searchQuery.trim().length > 0 && (
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
  inputContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: "#c7d2fe",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingRight: 40, // Space for the clear button
    backgroundColor: "#fff",
    color: "#1e293b",
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  clearButton: {
    position: "absolute",
    right: 10,
    padding: 4,
  },
  errorContainer: {
    marginTop: 8,
  },
});

export default SearchBar;
