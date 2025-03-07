import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useSettings } from "@/core/context/SettingsContext";
import UsuarioApiRepository from "@/core/repositories/usuario.repository";
import { UsuarioDto } from "@/types/usuarioTypes";

export default function Login() {
  const [users, setUsers] = useState<UsuarioDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UsuarioDto | null>(null);
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const { login } = useSettings();

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const fetchedUsers = await UsuarioApiRepository.getUsuarios();
        setUsers(fetchedUsers);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Error al obtener la lista de usuarios.");
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const handleLogin = async () => {
    setError("");
    if (!selectedUser) {
      setError("Seleccione un usuario.");
      return;
    }
    const success = await login(selectedUser.usuario, password);
    if (success) {
      router.replace("/(tabs)/comedor");
    } else {
      setError("Usuario o contraseña incorrectos");
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#60A5FA" />
      ) : !selectedUser ? (
        <>
          <Text style={styles.label}>Seleccione un usuario</Text>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <FlatList
            data={users}
            keyExtractor={(item) => item.usuario}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.userItem}
                onPress={() => setSelectedUser(item)}
              >
                <Text style={styles.userUsername}>{item.usuario}</Text>
                <Text style={styles.userName}>{item.nombreCompleto}</Text>
              </TouchableOpacity>
            )}
          />
        </>
      ) : (
        <>
          <Text style={styles.label}>
            Usuario: {selectedUser.nombreCompleto}
          </Text>
          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            placeholder="Ingrese su contraseña"
            secureTextEntry
            onChangeText={setPassword}
            value={password}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Iniciar Sesión</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setSelectedUser(null);
              setPassword("");
              setError("");
            }}
          >
            <Text style={styles.backButtonText}>
              Volver a seleccionar usuario
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#374151",
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    color: "#111827",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    marginBottom: 16,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#60A5FA",
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 18,
  },
  userItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: '#FFFFFF',
    marginVertical: 4,
    borderRadius: 8,
    elevation: 2,
  },
  userUsername: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  userName: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  backButton: {
    padding: 10,
    alignItems: "center",
  },
  backButtonText: {
    color: "#60A5FA",
    textDecorationLine: "underline",
  },
});
