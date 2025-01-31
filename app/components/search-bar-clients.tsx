import { TextInput, StyleSheet } from "react-native";

const SearchBarClient: React.FC<{
  value: string;
  onChangeText: (text: string) => void;
}> = ({ value, onChangeText }) => (
  <TextInput
    style={styles.searchInput}
    placeholder="Buscar por nombre o cédula"
    placeholderTextColor="#94a3b8"
    value={value}
    onChangeText={onChangeText}
    accessibilityLabel="Buscar clientes"
  />
);
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
export default SearchBarClient;
