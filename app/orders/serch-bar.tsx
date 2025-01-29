import React from "react";
import { TextInput, Text, View } from "react-native";

type SearchBarProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredMenu: any[];
};

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  filteredMenu,
}) => {
  // Determina si hay resultados en el menú filtrado
  const hasResults = filteredMenu && filteredMenu.length > 0;
  const borderColor =
    hasResults || !searchQuery ? "border-gray-400" : "border-red-400";

  return (
    <View>
      {/* Barra de búsqueda */}
      <TextInput
        style={{
          borderColor: borderColor,
          borderWidth: 1,
          borderRadius: 8,
          padding: 10,
          marginBottom: 8,
        }}
        placeholder="Buscar producto..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Mensaje de no resultados */}
      {!hasResults && searchQuery && (
        <Text style={{ textAlign: "center", color: "gray" }}>
          No se encontraron productos.
        </Text>
      )}
    </View>
  );
};

export default SearchBar;
