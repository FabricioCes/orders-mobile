import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { TextInput, StyleSheet, View, TouchableOpacity } from "react-native";

interface SearchBarClientProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
}

const SearchBarClient: React.FC<SearchBarClientProps> = ({
  value,
  onChangeText,
  onClear,
}) => (
  <View style={styles.container}>
    <TextInput
      style={styles.searchInput}
      placeholder="Buscar por nombre o cédula"
      placeholderTextColor="#94a3b8"
      value={value}
      onChangeText={onChangeText}
      accessibilityLabel="Buscar clientes"
    />
    {value.length > 0 && (
      <TouchableOpacity style={styles.clearButton} onPress={onClear}>
         <FontAwesome
              name='minus-circle'
              size={20}
              color="#94a3b8"
            />
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: "#c7d2fe",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingRight: 40, // Space for clear button
    backgroundColor: "#fff",
    color: "#1e293b",
    fontSize: 16,
  },
  clearButton: {
    position: "absolute",
    right: 10,
    padding: 4,
  },
});

export default SearchBarClient;
