import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

// Define la interfaz del contexto
interface SettingsContextType {
  saveSettings: (value: string) => void;
  login: (username: string, password: string) => Promise<boolean>;
  logOut: () => void;
  settings: string;
  hasUser: boolean;
  userName: string;
}

// Crea el contexto
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Proveedor del contexto
export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<string>("");
  const [hasUser, setHasUser] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");
  const [token, setToken] = useState<string>("");
  // Función para guardar configuraciones
  const saveSettings = async (value: string) => {
    try {
      await AsyncStorage.setItem("idComputadora", value); // Guardar en AsyncStorage
      setSettings(value); // Actualizar el estado
    } catch (error) {
      console.error("Error al guardar en AsyncStorage:", error);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("http://localhost:5001/autenticacion/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: username,
          clave: password,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok && data.resultado) {
        await AsyncStorage.setItem("token", data.resultado);
        await AsyncStorage.setItem("hasUser", "true");
        setHasUser(true);
        setUserName(username);
        return true; // Login exitoso
      } else {
        return false; // Login fallido
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      return false; // Error de red o servidor
    }
  };

  const logOut = async () => {
    try {
      await AsyncStorage.removeItem("hasUser");
      setHasUser(false);
      setUserName("");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    }
  }

  // Cargar el valor inicial desde AsyncStorage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedValue = await AsyncStorage.getItem("idComputadora");
        const userStatus = await AsyncStorage.getItem("hasUser");

        if (storedValue) {
          setSettings(storedValue);
        }

        if (userStatus === "true") {
          setHasUser(true); // Restaurar sesión si el usuario ya inició sesión previamente
        }
      } catch (error) {
        console.error("Error al cargar datos de AsyncStorage:", error);
      }
    };

    loadSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, saveSettings, login, hasUser, userName, logOut }}>
      {children}
    </SettingsContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings debe usarse dentro de un SettingsProvider");
  }
  return context;
};