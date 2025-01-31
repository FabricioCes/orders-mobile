import React from "react";
import { TextInput, View, StyleSheet} from "react-native";
import ErrorState from "../ErrorState";

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

  return (
    <View>
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar producto..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />


      {!hasResults && searchQuery && (
        <ErrorState message="No se econtraron Productos"/>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  searchInput: {
    height: 48,
    borderWidth: 1,
    borderColor: "#c7d2fe",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#fff",
    color: "#1e293b",
    fontSize: 16,
  }
});
export default SearchBar;
