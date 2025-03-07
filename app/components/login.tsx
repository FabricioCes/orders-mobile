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
import { Ionicons } from "@expo/vector-icons";

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
          <Text style={styles.label}>Bienvenido de vuelta</Text>

          <View style={{ position: "relative", width: "100%" }}>
            <View style={styles.inputIconContainer}>
              <Ionicons name="person" size={24} color="#64748B" />
            </View>
            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              placeholder="Ingrese su contraseña"
              placeholderTextColor="#94A3B8"
              secureTextEntry
              onChangeText={setPassword}
              value={password}
            />
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Ionicons
                name="alert-circle"
                size={20}
                color="#DC2626"
                style={styles.errorIcon}
              />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            activeOpacity={0.9}
          >
            <Text style={styles.buttonText}>Ingresar al sistema</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setSelectedUser(null);
              setPassword("");
              setError("");
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>
              ← Seleccionar otro usuario
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
    backgroundColor: "#F8FAFC",
    padding: 24,
  },
  label: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    marginBottom: 16,
    color: "#1E293B",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: 16,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    color: "#0F172A",
    fontSize: 16,
    paddingLeft: 48,
  },
  inputError: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    marginBottom: 16,
    fontFamily: "Inter-Medium",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  button: {
    padding: 18,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: "#FFFFFF",
    fontFamily: "Inter-Bold",
    fontSize: 18,
    letterSpacing: 0.5,
  },
  userItem: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  userUsername: {
    fontSize: 18,
    fontFamily: "Inter-Bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
    color: "#64748B",
    fontFamily: "Inter-Regular",
  },
  backButton: {
    padding: 12,
    alignItems: "center",
    marginTop: 8,
  },
  backButtonText: {
    color: "#2563EB",
    fontFamily: "Inter-SemiBold",
    fontSize: 14,
    textDecorationLine: "none",
  },
  // Nuevos estilos para iconos
  inputIconContainer: {
    position: "absolute",
    left: 16,
    top: 16,
    zIndex: 2,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
  },
  errorIcon: {
    marginRight: 8,
  },
});
